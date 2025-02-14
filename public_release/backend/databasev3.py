from typing import List, Optional
from peewee import *
from peewee import Model

class SeshDBManager:
    def __init__(self, db: PostgresqlDatabase) -> None:

        class User(Model):
            session_id = CharField(primary_key=True)
            conversation = CharField()
            last_active = CharField()

            class Meta:
                database = db
        
        
        self.user_model: 'Model' = User
        self.db: PostgresqlDatabase = db
        db.connect(reuse_if_open=True)
        db.create_tables([self.user_model], safe=True)

    def is_valid(self, user_id:int) -> bool:
        if int(user_id):
            return True
        return False

    def add_session(self, session_id: str, conversation: str, last_active: int) -> 'Model':
        with self.db.atomic():
            return self.user_model.create(
                session_id=session_id,
                conversation=conversation,
                last_active=last_active
            )
    
    def retrieve_session(self, session_id: str) -> Optional['Model']:
        with self.db.atomic():
            try:
                return self.user_model.get(self.user_model.session_id == session_id)
            except Exception as e:
                print(f"Error updating conversation: {e}")
                return None

    def update_conversation(self, session_id: str, conversation: str)  -> Optional['Model']:
        with self.db.atomic():
            try:
                #print('Getting new conversation update')
                #print(conversation)
                return self.user_model.update(conversation=conversation).where(self.user_model.session_id == session_id).execute()
                # query.execute()
                # return query
            except DoesNotExist as e:
                print(f"Error: {e}")
                return None


    def remove_session(self, session_id: str) -> Optional['Model']:
        with self.db.atomic():
            try:
                return self.user_model.get(session_id=session_id).delete_instance()
            except DoesNotExist as e:
                print(f"Error: {e}")
                return None

if __name__ == "__main__":
    db = SqliteDatabase("asessionsdb.db")
    db_manager = SeshDBManager(db)
    exit()

