## ChatifyIG

### Description:
ChatifyIG uses a React frontend and a Python Flask backend using LlamaIndex and PineCone to provide a chat-style RAG interface for documents.

## Instructions:
To use this project, you must have a Pinecone vector DB compatible with LlamaIndex vectors.
1. Chunk and upsert your PDF documents to PineCone
2. Setup and run backend Flask server with .env pointing to Pinecone deployment alongside OpenAI API keys
3. Setup and run React based frontend