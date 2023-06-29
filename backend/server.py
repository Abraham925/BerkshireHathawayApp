from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from  flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
import datetime
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from uuid import uuid4
import os

app = Flask(__name__)



app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:hello@localhost/berkshirehathaway'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY', default='\xe61\xc8\xaf\xb8~\xf2\x07\xc4\x05\x02\xc7\xf82\r')
jwt = JWTManager(app)

db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

def get_uuid():
    return uuid4().hex

class User(db.Model):
    id = db.Column(db.String(32), primary_key = True, unique = True, default= get_uuid)
    Name = db.Column(db.String(50))
    Email = db.Column(db.String(50), unique =True)
    Password = db.Column(db.Text(), nullable = False)
    Role = db.Column(db.Integer, nullable = False, default = 1)
    TotalPoints = db.Column(db.Integer, default = 0)

    def __init__(self, Name, Email,  Password):
        self.Name = Name
        self.Email = Email
        self.Password = Password
        

class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'Name', 'Email', 'Role', 'TotalPoints')

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class Tasks(db.Model):
    TaskId = db.Column(db.Integer, primary_key = True)
    TaskName = db.Column(db.String(50))
    TaskPoints = db.Column(db.Integer)
    TextDescription = db.Column(db.Text())
    DatePublished = db.Column(db.DateTime, default = datetime.datetime.now)
    Publisher = db.Column(db.String(50))
    Questions = db.relationship('Questions', backref='task', lazy=True)


    def __init__(self, TaskName, TaskPoints,  TextDescription, Publisher):
        self.TaskName = TaskName
        self.TaskPoints = TaskPoints
        self.TextDescription = TextDescription
        self.Publisher = Publisher

class TaskSchema(ma.Schema):
    class Meta:
        fields = ('TaskId', 'TaskName', 'TaskPoints', 'TextDescription', 'DatePublished', 'Publisher')

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(200))
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.TaskId'), nullable=False)

    def __init__(self, question_text, task_id):
        self.question_text = question_text
        self.task_id = task_id

class QuestionSchema(ma.Schema):
    class Meta:
        fields = ('id', 'question_text', 'task_id')

question_schema = QuestionSchema()
questions_schema = QuestionSchema(many=True)

class Teams(db.Model):
    TeamId = db.Column(db.Integer, primary_key = True)
    TeamName = db.Column(db.String(50))

    def __init__(self, TeamName):
        self.TeamName = TeamName
 
class TeamSchema(ma.Schema):
    class Meta:
        fields = ('TeamId', 'TeamName')

team_schema = TeamSchema()
teams_schema = TeamSchema(many=True)

class Realtor_Teams(db.Model):
    RealtorTeamId = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.String(32), db.ForeignKey('user.id'))
    TeamId = db.Column(db.Integer, db.ForeignKey('teams.TeamId'))

    user = db.relationship('User', backref=db.backref('Realtor_Teams', lazy=True))
    team = db.relationship('Teams', backref=db.backref('Realtor_Teams', lazy=True))

    def __init__(self, UserId, TeamId):
        self.UserId = UserId
        self.TeamId = TeamId

class Realtor_TeamsSchema(ma.Schema):
    class Meta:
        fields = ('RealtorTeamId', 'UserId', 'TeamId')

realtor_teams_schema = Realtor_TeamsSchema()
realtor_teams_schemas = Realtor_TeamsSchema(many=True)

@app.route("/register", methods = ['POST'])
def register_user():
    Name = request.json["Name"]
    Email = request.json["Email"]
    Password = request.json["Password"]

    user_exists = User.query.filter_by(Email = Email).first() is not None
    if user_exists:
        return jsonify({"error": "User already exists"}), 409
    hashed_password = bcrypt.generate_password_hash(Password)
    new_user = User(Name=Name, Email = Email, Password = hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return user_schema.jsonify(new_user)


@app.route("/login", methods = ['POST'])
def login_user():
    Email = request.json['Email']
    Password = request.json['Password']

    user = User.query.filter_by(Email=Email).first()

    if user is None or not bcrypt.check_password_hash(user.Password, Password):
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=Email)
    user_data = user_schema.dump(user)

    return jsonify(user=user_data, access_token=access_token), 200

@app.route("/token", methods = ["POST"])
def create_token():

    return ""

@app.route("/get", methods = ['GET'])
def get_articles():
    return jsonify({"Hello": "World"})


@app.route("/addTask", methods = ['POST'])
def add_tasks():
    TaskName = request.json['TaskName']
    TaskPoints = request.json['TaskPoints']
    TextDescription = request.json['TextDescription']
    Publisher = request.json['Publisher']
    questions = request.json['Questions']
    
    task = Tasks(TaskName, TaskPoints, TextDescription, Publisher)
    db.session.add(task)
    db.session.commit()

    for question_text in questions:
        question = Questions(question_text, task.TaskId)
        db.session.add(question)
    db.session.commit()

    return task_schema.jsonify(task)

@app.route("/addTeam", methods = ['POST'])
def add_teams():
    TeamName = request.json['TeamName']

    
    team = Teams(TeamName)
    db.session.add(team)
    db.session.commit()

    return team_schema.jsonify(team)

@app.route("/addToTeam", methods=['POST'])
def add_to_team():
    UserName = request.json['UserName']
    TeamName = request.json['TeamName']

    # Query the User and Teams tables to find the user and team
    user = User.query.filter_by(Name=UserName).first()
    team = Teams.query.filter_by(TeamName=TeamName).first()

    if user is None or team is None:
        # If the user or team wasn't found, return an error
        return jsonify({'error': 'User or team not found'}), 404

    # Create a new Realtor_Teams instance
    realtor_team = Realtor_Teams(user.id, team.TeamId)
    db.session.add(realtor_team)
    db.session.commit()

    return realtor_teams_schema.jsonify(realtor_team)

if __name__ == "__main__":
    from server import app, db

    with app.app_context():
      db.create_all()

    app.run(debug=True)