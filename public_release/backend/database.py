from typing import List, Optional
from peewee import *
from peewee import Model

class UserDBManager:
    def __init__(self, db: PostgresqlDatabase) -> None:

        class User(Model):
            user_id = CharField(primary_key=True)
            first_name = CharField()
            last_name = CharField()
            email = CharField()
            password = CharField()
            total_time_spent = CharField(null=True)

            class Meta:
                database = db
        
        def to_dict(self) -> dict:
            return {
                'user_id':self.user_id,
                'first_name':self.first_name,
                'last_name':self.last_name,
                'bedrooms':self.bedrooms,
                'email':self.email,
                'password':self.password,
                'total_time_spent':self.total_time_spent

            }
        
        self.user_model: 'Model' = User
        self.db: PostgresqlDatabase = db
        db.connect(reuse_if_open=True)
        db.create_tables([self.user_model], safe=True)

    def is_valid(self, user_id:int) -> bool:
        if int(user_id):
            return True
        return False

    def user_exists(self, email: int) -> bool:
        with self.db.atomic():
            return bool(self.user_model.select().where(self.user_model.email == email).exists())
    
    def add_user(self, user_id: str, first_name: str, last_name: str, email: str, password: str, total_time_spent: int) -> 'Model':
        with self.db.atomic():
            #if not self.is_valid(user_id):
            #    raise ValueError("Invalid user ID type.")
            #Ensure user d
            return self.user_model.create(
                user_id = user_id,
                first_name = first_name,
                last_name = last_name,
                email = email,
                password = password,
                total_time_spent = total_time_spent
            )
    
    def get_user_by_id(self, user_id: int) -> Optional['Model']:
        with self.db.atomic():
            try:
                return self.user_model.get(self.user_model.user_id == user_id)
            except DoesNotExist:
                return None

    def get_user_by_email(self, email: str) -> Optional['Model']:
        with self.db.atomic():
            try:
                return self.user_model.get(self.user_model.email == email)
            except DoesNotExist:
                return None


if __name__ == "__main__":
    db = SqliteDatabase("userdb.db")
    db_manager = UserDBManager(db)
    exit()

