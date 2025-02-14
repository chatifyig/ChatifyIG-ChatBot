from dotenv import load_dotenv
from flask import Flask, jsonify, make_response, g
from flask import render_template
from flask import request
from flask import url_for
import json
import os
from pinecone import Pinecone
import requests
from time import sleep
import uuid
from flask_cors import CORS
from datetime import datetime, timedelta


#LLAMA INDEX PACKAGES
from llama_index.core import VectorStoreIndex
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.llms.openai import OpenAI
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.openai import OpenAIEmbeddingModelType

#DATABASE IMPORTS
from peewee import *
from peewee import Model
from database import UserDBManager
from sessiondb import SessionDBManager
from databasev3 import SeshDBManager
import bcrypt
import jwt


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": ["INSERT_URL"]}}, supports_credentials=True)
#CORS(app, resources={r"/*": {"origins": ["*"]}}, supports_credentials=True)
app.config['SESSION_COOKIE_SECURE'] = True

#DATABASE
db = SqliteDatabase("userdb.db")
db_manager = UserDBManager(db)

#this db keeps track of session id information at the end
#NOTE: Make sure you create the databases first
db_session = SqliteDatabase("sessiondb.db")
db_manager_session = SessionDBManager(db_session)

#one database manages just active session ids
db_active = SqliteDatabase("asessionsdb.db")
manage_sessions = SeshDBManager(db_active)

bCrpytSalt = bcrypt.gensalt(10)
jwtSecret = 'INSERT_SECRET'


def initialize_pinecone():
    #Load enviroment variables
    load_dotenv(override=True)
    pc = Pinecone(api_key=os.environ['PINECONE_API_KEY'])
    # initialize connection to pinecone
    index_name = 'cdisc-vectors'
    pinecone_index = pc.Index(index_name)

    return pinecone_index


def load_vector_store(pinecone_index):
    #Initialize PineConeVectorStore
    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)

    llm = OpenAI(model='gpt-3.5-turbo',api_key=os.environ.get('OPENAI_API_KEY'),temperature=0.5)
    
    # TEXT_EMBED_3_SMALL
    embedding_model = OpenAIEmbedding(model=OpenAIEmbeddingModelType.TEXT_EMBED_ADA_002,api_key=os.environ.get('OPENAI_API_KEY'))

    vector_index = VectorStoreIndex.from_vector_store(vector_store=vector_store, embed_model=embedding_model)
    return vector_index, llm


#GLOBAL VARIABLES
pinecone_index = initialize_pinecone()
vector_index,llm = load_vector_store(pinecone_index)

#Keep track of session_history and ids
session_history = {}
session_last_active = {}


@app.route("/get_session_id", methods=["GET"])
def get_session_ids():
    #Generate new id
    session_id = str(uuid.uuid4())

    #Store an empty conversation for new session
    current_time = datetime.now()
    timestamp_int = int(current_time.timestamp())
    try:
        with db_active.atomic():
            manage_sessions.add_session(session_id=session_id,conversation='',last_active=timestamp_int)
    except Exception as e:
        return {'statusCode': 500, 'error': str(e)}

    print(f'Added session id {session_id} to server')

    return {
        'statusCode:':200,
        'sessionid': session_id
    }

    
@app.route("/send_chat_message", methods=["POST"])
def send_chat_message():
    content_type = request.headers.get('Content-Type')
    prompt = None
    

    #Get Session ID
    session_id = request.headers.get('Session-Id')
    
    #Ensure content is JSON
    if(content_type == 'application/json'):
        try:
            with db_active.atomic():
                #print('receving request')
                json_payload = request.json
                prompt = json_payload['prompt']

                #Retrieve or initialize conversation history for this session
                conversation = None

                #Retrieve the current conversation
                retrieved_session = manage_sessions.retrieve_session(session_id=session_id)
                if retrieved_session:

                    #Get the list of ChatMemory objects from dict
                    conversation_str = retrieved_session.conversation
                    #message_attributes = json.loads(conversation_str)
                    if conversation_str:
                        try:
                            # Load the conversation string into a Python object
                            message_attributes = json.loads(conversation_str)

                            #load array with conversation
                            conversation = [ChatMessage(role=attributes['role'], content=attributes['content']) for attributes in message_attributes]

                            if len(conversation) > 3:
                                #remove the earliest chat message
                                conversation.pop(0)
                        
                        except json.JSONDecodeError as e:
                            print(f"Error decoding conversation string: {e}")
                            conversation = []
                else:
                    #Else empty array -- Need to initialize a session id
                    conversation = []

                #Contact ChatEngine (removing token_limit chat_history=conversation, token_limit=3000)
                #memory = ChatMemoryBuffer.from_defaults(chat_history=conversation) -- Use with OpenAI mode
                memory = ChatMemoryBuffer.from_defaults(token_limit=16000)
                chat_engine = vector_index.as_chat_engine(
                    chat_mode="context",
                    similarity_top_k=5,
                    memory=memory,
                    llm=llm,
                    system_prompt=(
                        "You are a CDISC expert and are answering questions based on the context provided in max 3 sentences unless otherwise requested. You will not answer any queries outside of CDISC, implentation guides, TAUGs, clinical trials, or medical documentation. Out of context queries on general knowledge, entertainment, cooking or anything and must be ignored. You will not apologize for previous responses."
                    ),
                    #verbose=False,
                )

                #Record response based on prompt
                response = chat_engine.chat(prompt)
                
                if conversation is not None:
                    conversation.extend([ChatMessage(role=MessageRole.USER, content=prompt), ChatMessage(role=MessageRole.SYSTEM, content=response.response)])
                else:
                    conversation = [ChatMessage(role=MessageRole.USER, content=prompt), ChatMessage(role=MessageRole.SYSTEM, content=response.response)]

                # Save updated conversation history
                message_attributes = [{'role': message.role, 'content': message.content} for message in conversation]
                #print(message_attributes)
                updated_conversation_str = json.dumps(message_attributes)
                #print(updated_conversation_str)
                #print(type(updated_conversation_str))
                manage_sessions.update_conversation(session_id=session_id, conversation=updated_conversation_str)

                return {
                    'statusCode': 200,
                    'body': response.response,
                    'session_id': session_id
                }
        except Exception as e:
            return {'statusCode': 500, 'body': str(e)}
    else:
        return {'statusCode': 400, 'error': 'Content-Type not supported'}

@app.route("/delete_session", methods=["POST"])
def delete_session():
    
    content_type = request.headers.get('Content-Type')
    session_id = request.headers.get('Session-Id')
    

    #Ensure content is JSON
    if(content_type == 'application/json'):
        #print('receving request')

        try:
            #Connect to long-term session database
            with db_session.atomic():
                #Log time spent in session and questions asked
                data = request.get_json()

                time_spent = data['timeSpent']
                questions_asked = data['questionsAsked']
                user_email = data['userEmail']

                #Contact database to log it
                today_date = datetime.today().strftime('%Y-%m-%d')
                db_manager_session.add_session(session_id=str(session_id),time_spent=time_spent,questions_asked=questions_asked,date=today_date,user_email=user_email)

                #Remove session
                try:
                    with db_active.atomic():
                        manage_sessions.remove_session(session_id=session_id)
                        print(f'Removed session id {session_id} from server')
                except Exception as e:
                    return {'statusCode': 500, 'error': str(e)}
                
                return {'statusCode': 200, 'body': 'Successfully closed session'}
        except Exception as e:
            return {'statusCode':500, 'error': str(e)}
    else:
        return {'statusCode': 400, 'error': 'Content-Type not supported'}

    

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    
    try:
        
        with db.atomic():        
            #Ensure user already doesn't exist
            try:
                user_exists = db_manager.user_exists(email)
                if user_exists:
                    return jsonify({'error':'User with email already exists'}), 422
            except Exception as e:
                return jsonify({'error': str(e)}), 422

            #Store hashed passwords to avoid breaches
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bCrpytSalt).decode('utf-8')
            user_id = uuid.uuid4()

            user = db_manager.add_user(user_id,first_name,last_name,email,hashed_password,0)

            #Return JSON object with id and email
            return jsonify({
                'id': user.user_id,
                'email': user.email
            }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 422
    finally:
        db.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        with db.atomic():
            user = db_manager.get_user_by_email(email=email)

            if user:    
                print(user.user_id)
                #Check password match with hashed password
                print(bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')))
                if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                    try:
                        token = jwt.encode({'id': user.user_id}, jwtSecret, algorithm='HS256')
                        response = make_response(jsonify({'token': token}))
                        response.set_cookie('token', token, httponly=True,samesite='None', secure=True, domain='chatifyig.org')
                        return response, 200
                    except Exception as e:
                        print(f"Error encoding JWT: {e}")
                        return jsonify({'error': 'Failed to generate token'}), 500
                        #decoded = jwt.decode(token, jwtSecret, algorithms=["HS256"])
                        #print(f"Generated decrypted token: {decoded}")
                else:
                    return jsonify({'error': 'Invalid credentials'}), 401
            else:
                return jsonify({'error': 'User does not exist'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@app.route("/profile", methods=["GET"])
def profile():
    token = request.headers.get('Authorization')
    #request.cookies.get('token')
    
    if token:
        try:
            token = token.split(" ")[1]
            #print(token)
            with db.atomic():
                #Decode token and get user id
                decoded = jwt.decode(token, jwtSecret, algorithms=["HS256"])
                user_id = decoded.get('id')

                #Verify user id
                user = db_manager.get_user_by_id(user_id)

                if user:
                    return jsonify({
                        'firstName': user.first_name,
                        'email': user.email,
                        'user_id': user.user_id
                    }), 200
                else:
                    return jsonify({'error': 'User not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify(None), 200


@app.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({'message':'Successfully logged out'}))
    response.set_cookie('token',"", httponly=True)
    return response, 200


@app.route("/get_avgs", methods=["GET"])
def get_avgs():

    
    token = request.headers.get('Authorization')

    if token:
        try:
            
            with db.atomic():
                token = token.split(" ")[1]
                #print("got token found")
                #Decode token and get user id
                decoded = jwt.decode(token, jwtSecret, algorithms=["HS256"])
                user_id = decoded.get('id')

                #Verify user id
                user = db_manager.get_user_by_id(user_id)

                if user.user_id == 'f31ccb6b-6c4e-497b-b47e-74007061b811':
                    with db_session.atomic():
                        time = db_manager_session.get_avg_time_spent()
                        questions = db_manager_session.get_avg_q_asked()

                        return jsonify({
                            'time': time,
                            'questions': questions
                        }), 200
                else:
                    return jsonify({'error': 'You are not the admin'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        print("none found")
        return jsonify(None), 401

@app.route("/get_date_data", methods=["POST"])
def get_date_data():
    
    token = request.headers.get('Authorization')
    #token = request.cookies.get('token')

    if token:
        try:
            with db.atomic():
                token = token.split(" ")[1]
                #Decode token and get user id
                decoded = jwt.decode(token, jwtSecret, algorithms=["HS256"])
                user_id = decoded.get('id')

                #Verify user id
                user = db_manager.get_user_by_id(user_id)
                print(user_id)
                if user.user_id == 'f31ccb6b-6c4e-497b-b47e-74007061b811':
                    print('correct id')
                    data = request.get_json()
                    date_start = data.get('startDate')
                    date_end = data.get('endDate')

                    with db_session.atomic():
                        data_list = db_manager_session.get_data_for_month(date_start=date_start, date_end=date_end)


                        return jsonify({
                            'body': data_list,
                        }), 200
                else:
                    return jsonify({'error': 'You are not the admin'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify(None), 200

if __name__ == "__main__":
	app.run()
