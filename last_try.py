from flask import Flask, request, jsonify
import os
import json
import asyncio
import random
import psycopg2
from pypdf import PdfReader
from flask_cors import CORS# Import your modules (make sure they are in your PYTHONPATH or same directory)
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from google import genai
from langchain_postgres import PGVector
from langchain_core.documents import Document
import pymysql
import pymysql.cursors
from flask_cors import CORS
import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from google.oauth2 import service_account
import pickle
from googleapiclient.discovery import build
import logging
from werkzeug.utils import secure_filename
from sentence_transformers import SentenceTransformer, util
import time
#CONSTANTS

#CONSTANTS

GOOGLE_API_KEY_P = "AIzaSyDV5OrNTYhAL2XgnC4bmjTuTYWWXhv7_VE"
GOOGLE_API_KEY_C = "AIzaSyBBr52tWF3NFz0AqlZDzNJ1G1YwPnRBte4"
CONNECTION_STRING = 'postgresql://avnadmin:AVNS_0idLIScPnb0L5BezPah@incommon-incommon.i.aivencloud.com:14604/defaultdb?sslmode=require'
COLLECTION_NAME_EMPLOYEE = 'TBH_resume'
COLLECTION_TEAM = 'TBH_Project'
SYSTEM_PROMPT = '''You are an AI Assistant with Start, Input, Plan, Conversation, and Output states.  
Wait for the User Prompt and first PLAN using the Input.  
After Planning, take the appropriate Tools and wait for Observation based on action.  
Once You get the Observation, return the AI Response based on the Start Prompt and Observations.  

You will evaluate if the user **should be selected** for the applied role by analyzing how well their skillset matches the required skills. Additionally, provide a **rating score (out of 10)** within the output statement itself.  

**Prompt:**  
{"type" : "input" ,"Role" : "<Role Applied>" ,"Email" : "<Candidates Email>","Name" : "<Candidate's Name>" , "Education" : "<Candidate's Education>" , "Description" : "<Candidate's Description>" , "Experience" : "<Candidate's Experience>" ,"Projects" : "<Candidate's Project Description>" , "Skills" : "<Candidate's Skills>" , "Required Skills":"<Required Skills for the Opening>"}  

**Return Type:**  
**START**  

**Example:**  

{"type": "system", "Role": "Software Developer","Email" : "akshay1234@gmail.com", "Education": "B.Tech in Computer Science", "Description": "Akshay is a skilled full-stack developer with expertise in React and Node.js.", "Experience": "3 years in Full-Stack Development", "Projects": "Developed scalable web applications and contributed to open-source projects."}  

{"type": "plan", "plan": "Assess whether Akshay meets the requirements for the Software Developer role."}  

{"type": "conversation", "discussion": [  
    {"panelist": "HR", "statement": "Akshay has a B.Tech in Computer Science. Is his academic background relevant to the role?"},  
    {"panelist": "Tech Lead", "statement": "Yes, and he has 3 years of Full-Stack Development experience, which aligns with our requirements."},  
    {"panelist": "Project Manager", "statement": "His experience with React and Node.js matches our tech stack. Are there any gaps in his skillset?"},  
    {"panelist": "HR", "statement": "He lacks experience in cloud deployment, which is part of our requirements."},  
    {"panelist": "Tech Lead", "statement": "That can be learned on the job. Overall, his experience and projects show he’s a strong fit."}  
]}  

{"type": "output", "Name" : "Akshay" , "Email" : "akshay1234@gmail.com", "output": "Akshay is suitable for the Software Developer role based on his skillset and experience. We rate him 8.5/10 for the applied role, and he should proceed to the next round of selection."}  

OR  

{"type": "output", "Name" : "Akshay" , "Email" : "" , "output": "Akshay does not fully meet the requirements for the Software Developer role due to missing key skills (e.g., cloud deployment, database optimization). We rate him 3/10 for the applied role, and he may not be suitable for this position."}  


NOTE : Also If the Candidate is Selected , Try to Say About Which round to mainly focus on And Also On What context Should the Questions Should focus.
    And If the Candidate is not Selected , Try To Explain Where are his skills Lacking and What Should he Be Improving.


Return only one state at a time in JSON format only.  '''

SYSTEM_PROMPT_R = '''
You are an AI Assistant with Start , input  and Output State.
Wait for the User Prompt and first PLAN using the Input.
Once You get the Observation , return the AI Response Based on the Start Prompt and Observations.

Prompt:
{
  "instruction": "You are an AI Assistant that parses unstructured resume data and converts it into a structured JSON format based on the role applied. The input is an unstructured text-based resume, and the output is a structured JSON representation.",
  "input_format": {
    "type": "input",
    "data": "<Unstructured Resume Text>",
    "role": "<Applied Role>",
    "Required Skills" : "<Required Skills for the OPENING>"
}
Return Type : 
"output_format": {
    "type": "output",
    "Role": "<Role from input>",
    "Email" : "<Candidates Email>",
    "Name": "<Candidates Name>",
    "Education": "<Extracted Candidate's Education>",
    "Description": "<Brief Summary of Candidate>",
    "Experience": "<Extracted Candidate's Work Experience>",
    "Projects": "<Extracted Notable Projects Candidate Has Worked On>",
    "Skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>", "..."],
    "Required Skills" : "<Required Skills for the OPENING>"
}


Example :
Input
{
  "role": "AI Engineer",
  "instruction": "You are an AI Assistant that parses unstructured resume data and converts it into a structured JSON format based on the role applied. The input is an unstructured text-based resume, and the output is a structured JSON representation.",
  "input_format": {
    "type": "input",
    "data": "John Doe is an AI Engineer with a strong background in machine learning and deep learning. He holds a Master's degree in Computer Science from MIT. John has 4 years of experience working at top AI research labs, where he developed computer vision models and optimized deep learning algorithms. His notable projects include building an AI-powered recommendation system and deploying NLP models for sentiment analysis. He is proficient in Python, TensorFlow, PyTorch, and cloud platforms like AWS and GCP.",
    "Required Skills" : "["Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS"]"
}

Output{
    "type": "output",
    "Role": "AI Engineer",
    "Email" : "<Candidates Email>",
    "Name" : "John Doe",
    "Education": "Master's in Computer Science from MIT",
    "Description": "John Doe is an AI Engineer with expertise in deep learning, computer vision, and NLP.",
    "Experience": "4 years of experience in AI research labs, working on deep learning optimization and computer vision models.",
    "Projects": [
      "Developed an AI-powered recommendation system",
      "Deployed NLP models for sentiment analysis"
    ],
    "Skills": [
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS",
      "GCP",
      "Model Deployment"
    ],
    "Required Skills" : "["Natural Language Processing",
      "Computer Vision",
      "Python",
      "TensorFlow",
      "PyTorch",
      "AWS"]"
  }

Give me Output state directly

Return only One State at a Time in JSON Format only
'''

SYSTEM = '''Analyze the job posting prompt provided by the user and extract key details to generate a structured JSON file. The JSON should include:

1. **job_role**: The specific job title or role mentioned in the prompt.
2. **job_skills**: A list of relevant skills required for the job, extracted from the description.
3. **description**: A concise summary of the job posting, retaining all essential details.

NOTE : If Not Provided Make Sure you Understand the Prompt and Not return a Empty String

Ensure the extracted information accurately represents the user's input. Return the output in a properly formatted JSON structure.

### Example Input:
"Looking for a skilled Data Scientist with expertise in Python, Machine Learning, and SQL. The ideal candidate should have experience working with large datasets and deploying predictive models."

### Expected Output:
{
    "type" : "output",
    "output" :{
    "job_role": "Data Scientist",
    "job_skills": ["Python", "Machine Learning", "SQL", "Data Analysis", "Predictive Modeling"],
    "description": "Hiring a Data Scientist proficient in Python, Machine Learning, and SQL. The role involves working with large datasets and deploying predictive models."
    }
}
'''

# Database connection function
def conn():
    host = "incommon-incommon.i.aivencloud.com"
    dbname = "defaultdb"
    username = "avnadmin"
    port = 14604
    pwd = "AVNS_0idLIScPnb0L5BezPah"
    connection = psycopg2.connect(
        host=host,
        dbname=dbname,
        user=username,
        port=port,
        password=pwd
    )
    cur = connection.cursor()

    # Clear all rows from the collection
    cur.execute("DELETE FROM public.langchain_pg_embedding;")
    connection.commit()
    cur.execute("DELETE FROM public.langchain_pg_collection;")
    connection.commit()
    cur.execute('DELETE FROM public."TBH_RESUME";')
    connection.commit()

    return connection, cur

# Adding documents (resumes) to vector database
def add_doc(documents):
    connection,cursor = conn()
    embeddings = GoogleGenerativeAIEmbeddings(google_api_key=GOOGLE_API_KEY_P, model="models/text-embedding-004")
    db = PGVector(embeddings, connection=CONNECTION_STRING, collection_name=COLLECTION_NAME_EMPLOYEE, use_jsonb=True)
    db.add_documents(documents)

# Async function to match Employees
async def employee_matching(job_skills, embeddings, min_selection):
    db = PGVector(embeddings, connection=CONNECTION_STRING, collection_name=COLLECTION_NAME_EMPLOYEE, use_jsonb=True)
    results = db.similarity_search(job_skills, k=min_selection)
    return results

# Initialise AI agent
def initialize_model(client, prompt):
    chat = client.chats.create(model="gemini-2.0-flash")
    response = chat.send_message(prompt)
    return chat

# Converting string to JSON safely
def jsond(text):
    if not text.strip():
        raise ValueError("Empty response text received from the AI service.")
    
    start_index = text.find("{")
    end_index = text.rfind("}")
    if start_index == -1 or end_index == -1:
        raise ValueError(f"Response text does not contain valid JSON delimiters: {text}")
    
    try:
        clean_text = json.loads(text[start_index:end_index+1])
    except Exception as e:
        raise ValueError(f"Error parsing JSON from response text: {e} | Raw response: {text}")
    
    return clean_text


# Extracting Job Strings from the Prompt 
def posting(chat, prompt):
    response = chat.send_message(prompt)
    raw_response = response.text
    print("Raw AI response from posting:", raw_response)
    
    try:
        clean_text = jsond(raw_response)
    except Exception as e:
        print("Error parsing JSON:", e)
        raise

    # Fallback: If 'type' key is missing, check if 'output' exists directly.
    if "type" not in clean_text and "output" in clean_text:
        print("Fallback: 'type' key missing, but 'output' is present.")
        clean_text["type"] = "output"

    if "type" not in clean_text:
        print("DEBUG: Parsed JSON from AI response:", clean_text)
        raise ValueError(f"Expected key 'type' not found in response: {clean_text}")
    
    if clean_text["type"].lower() == "output":
        return response
    else:
        print("DEBUG: Response 'type' is not output, received:", clean_text.get("type"))
        raise ValueError(f"Unexpected 'type' value in response: {clean_text}")


# Asynchronous chat functions
async def chats(chat, prompt):
    response = chat.send_message(prompt)
    clean_text = jsond(response.text)
    if clean_text["type"].lower() in ["conversation", "plan"]:
        response = await chats(chat, response.text)
    elif clean_text["type"].lower() == "output":
        return response
    else:
        return response
    return response

async def chats_r(chat, prompt):
    response = chat.send_message(prompt)
    clean_text = jsond(response.text)
    if "state" in clean_text.keys():
        if clean_text["state"].lower() == "output":
            return clean_text
    elif "type" in clean_text.keys():
        if clean_text["type"].lower() == "output":
            return clean_text
    else:
        await chats_r(chat, clean_text)
    return jsond(response.text)

# Helper to parse a PDF file from an uploaded file object
def parse_resume_file(file_obj, role, skillset):
    resume_text = []
    reader = PdfReader(file_obj)
    for page in reader.pages:
        resume_text.append(page.extract_text())
    resume_data = {
        "type": "input",
        "data": resume_text,
        "role": role,
        "Required Skills" : skillset
    }
    return resume_data

# Asynchronous function to convert unstructured resume to structured format using file object
async def un_to_st_file(file_obj, role, skillset, chat):
    file_obj.seek(0)
    unstructured = parse_resume_file(file_obj, role, skillset)
    structured = await chats_r(chat, json.dumps(unstructured))
    return structured

# Async processing function which replicates your main logic
async def process_resumes_async(prompt, openings, resume_files):
    # Initialising Clients
    client = genai.Client(api_key=GOOGLE_API_KEY_P)
    client2 = genai.Client(api_key=GOOGLE_API_KEY_C)

    # JobString Extraction from Input
    response = posting(initialize_model(client, SYSTEM), prompt)
    text = jsond(response.text)["output"]

    job_role = str(text["job_role"])
    job_skills = str(text["job_skills"])
    Description = str(text["description"])

    # Use the uploaded resume files
    chat_model = initialize_model(client, SYSTEM_PROMPT_R)
    model = initialize_model(client2, SYSTEM_PROMPT)
    all_documents = []

    for file_obj in resume_files:
        print(f"Processing Resume: {file_obj.filename}")
        structured_resume = await un_to_st_file(file_obj, job_role, job_skills, chat_model)
        skills = structured_resume["Skills"]
        job_skill_doc = Document(
            page_content=f"SkillSet: {skills}, Resume Data: {structured_resume}",
            metadata={"id": random.randint(100, 1000), "Role": job_role}
        )
        all_documents.append(job_skill_doc)

    # Adding parsed resumes to the vector database
    if all_documents:
        print("Adding resumes to database...")
        add_doc(all_documents)
    else:
        return {"error": "No valid resumes found"}

    # Generating embeddings to match resumes with required skillset
    embeddings = GoogleGenerativeAIEmbeddings(
        google_api_key=GOOGLE_API_KEY_P, model="models/text-embedding-004"
    )
    print("Required Skillset: ", job_skills, "\n")

    employees = await employee_matching(job_skills, embeddings, openings)

    # Evaluating Matched Employees Data Using Agent
    candidates = []
    for employee in employees:
        response = await chats(model, json.dumps(employee.page_content))
        candidate_output = jsond(response.text)
        candidates.append(candidate_output)

    return {
        "job_role": job_role,
        "job_skills": job_skills,
        "description": Description,
        "candidates": candidates
    }

app = Flask(__name__)
CORS(app)  # This will allow all origins by default


@app.route('/process_resumes', methods=['POST'])
def process_resumes():
    print("=== Received a POST request to /process_resumes ===")
    
    # Get form fields
    prompt = request.form.get('prompt')
    openings = request.form.get('openings', 1)
    print(f"Prompt received: {prompt}")
    print(f"Openings (raw value): {openings}")
    
    try:
        openings = int(openings)
        print(f"Converted openings to integer: {openings}")
    except ValueError as e:
        print(f"Error converting openings to int: {openings}. Exception: {e}")
        return jsonify({"error": "Invalid number of openings"}), 400

    # Get all uploaded resume files (input name should be "resumes")
    resume_files = request.files.getlist('resumes')
    print(f"Number of resume files received: {len(resume_files)}")
    for idx, file in enumerate(resume_files):
        print(f"File {idx + 1}: {file.filename}")

    if not prompt or not resume_files:
        print("Missing prompt or resume files. Aborting request.")
        return jsonify({"error": "Missing prompt or resume files"}), 400

    # Run the asynchronous processing function
    try:
        print("Starting asynchronous processing of resumes...")
        result = asyncio.run(process_resumes_async(prompt, openings, resume_files))
        print("Asynchronous processing completed successfully.")
        print("Result:", json.dumps(result, indent=2))
    except Exception as e:
        print("Error during processing resumes:")
        print(e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    return jsonify(result)
def connect_db():
    try:
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='1234',
            database='wework',
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        raise

def update_employee_status(cursor, conn, employee_id, new_status='Busy'):
    try:
        update_query = "UPDATE employees SET availability_status = %s WHERE id = %s"
        cursor.execute(update_query, (new_status, employee_id))
        conn.commit()
    except Exception as e:
        print("Error updating status for employee id {}: {}".format(employee_id, e))
        conn.rollback()

def clean_employee(emp):
    if not emp:
        return None
    emp_copy = emp.copy()
    emp_copy.pop('skills_embedding', None)
    return emp_copy

def fetch_assignment_data(cursor, project_id):
    # Fetch project by id
    cursor.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
    project = cursor.fetchone()
    # Fetch project requirements for that project
    cursor.execute("SELECT * FROM project_requirements WHERE project_id = %s", (project_id,))
    requirements = cursor.fetchall()
    # Fetch all employees with skills, proficiency_level, and years_experience
    cursor.execute("""
        SELECT e.id, e.name, e.role, e.availability_status, es.skills, es.proficiency_level, es.years_experience
        FROM employees e
        JOIN employee_skills es ON e.id = es.employee_id
    """)
    employees = cursor.fetchall()
    return project, requirements, employees

def filter_available(employees):
    return [emp for emp in employees if emp['availability_status'].lower() == 'available']

def compute_embeddings(employees, model):
    for emp in employees:
        # Convert the comma-separated skills string into a single sentence
        emp['skills_embedding'] = model.encode(emp['skills'], convert_to_tensor=True)

def match_role_with_threshold(requirement_text, candidates, model, start_threshold, top_n=1, lower_bound=3):
    """
    Given a requirement text and a list of candidate employees,
    first filter candidates whose proficiency_level >= threshold.
    If no candidates found, lower the threshold iteratively until lower_bound.
    Then, select top_n candidates based on cosine similarity between
    the requirement embedding and the candidate's skills embedding.
    """
    req_embedding = model.encode(requirement_text, convert_to_tensor=True)
    
    def candidate_similarity(emp):
        return util.pytorch_cos_sim(req_embedding, emp['skills_embedding']).item()
    
    for threshold in range(start_threshold, lower_bound - 1, -1):
        filtered = [emp for emp in candidates if emp['proficiency_level'] >= threshold]
        if filtered:
            filtered.sort(key=lambda emp: candidate_similarity(emp), reverse=True)
            return filtered[:top_n]
    if candidates:
        candidates.sort(key=lambda emp: candidate_similarity(emp), reverse=True)
        return candidates[:top_n]
    return []

def get_candidates_for_role(req, min_threshold, candidates, model, num_candidates=1):
    if req is None:
        return []
    return match_role_with_threshold(req['required_skill'], candidates, model, start_threshold=min_threshold, top_n=num_candidates, lower_bound=3)

# Existing GET endpoint to fetch all projects
@app.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects")
        projects = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(projects)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Existing POST endpoint to create a new project and update its requirements
@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    required_skill = data.get("required_skill")
    
    if not name or not description or not required_skill:
        return jsonify({"error": "Missing required fields: name, description, and required_skill are required."}), 400
    
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Insert into the projects table
        project_query = "INSERT INTO projects (name, description) VALUES (%s, %s)"
        cursor.execute(project_query, (name, description))
        project_id = cursor.lastrowid  # Retrieve the auto-generated project ID
        
        # Insert into the project_requirements table
        req_query = "INSERT INTO project_requirements (project_id, required_skill) VALUES (%s, %s)"
        cursor.execute(req_query, (project_id, required_skill))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Project created successfully", "project_id": project_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New endpoint: Assign team members for a given project ID
@app.route('/api/assign-team/<int:project_id>', methods=['POST'])
def assign_team(project_id):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Fetch project, requirements, and employees for the given project id
        project, requirements, employees = fetch_assignment_data(cursor, project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        
        available_employees = filter_available(employees)
        
        # Load SentenceTransformer model and compute embeddings for available employees
        model = SentenceTransformer('all-MiniLM-L6-v2')
        compute_embeddings(available_employees, model)
        
        # Extract role-specific requirements using keywords (for demo purposes)
        frontend_req = next((req for req in requirements if any(kw.lower() in req['required_skill'].lower() 
                                                                for kw in ['React', 'UI/UX', 'Frontend'])), None)
        backend_req = next((req for req in requirements if any(kw.lower() in req['required_skill'].lower() 
                                                               for kw in ['Node.js', 'Express', 'Backend'])), None)
        aiml_req = next((req for req in requirements if any(kw.lower() in req['required_skill'].lower() 
                                                            for kw in ['Machine Learning', 'TensorFlow', 'PyTorch', 'NLP'])), None)
        
        # Set starting thresholds; use default if not provided
        frontend_min = frontend_req['min_proficiency_level'] if frontend_req and frontend_req.get('min_proficiency_level') else 4
        backend_min = backend_req['min_proficiency_level'] if backend_req and backend_req.get('min_proficiency_level') else 4
        aiml_min = aiml_req['min_proficiency_level'] if aiml_req and aiml_req.get('min_proficiency_level') else 5
        
        team_assignments = {}
        # Frontend role
        frontend_candidates = get_candidates_for_role(frontend_req, frontend_min, available_employees, model, num_candidates=1)
        frontend_candidate = frontend_candidates[0] if frontend_candidates else None
        if frontend_candidate:
            team_assignments['frontend_developer'] = frontend_candidate
            available_employees = [emp for emp in available_employees if emp['id'] != frontend_candidate['id']]
        else:
            team_assignments['frontend_developer'] = None
        
        # Backend role
        backend_candidates = get_candidates_for_role(backend_req, backend_min, available_employees, model, num_candidates=1)
        backend_candidate = backend_candidates[0] if backend_candidates else None
        if backend_candidate:
            team_assignments['backend_developer'] = backend_candidate
            available_employees = [emp for emp in available_employees if emp['id'] != backend_candidate['id']]
        else:
            team_assignments['backend_developer'] = None
        
        # AIML role: need 3 candidates
        aiml_candidates = match_role_with_threshold(aiml_req['required_skill'], available_employees, model, start_threshold=aiml_min, top_n=3, lower_bound=3) if aiml_req else []
        team_assignments['aiml_engineers'] = aiml_candidates
        for candidate in aiml_candidates:
            available_employees = [emp for emp in available_employees if emp['id'] != candidate['id']]
        
        # Update employee statuses and insert assignments into assigned_projects table
        assignments = []
        if team_assignments.get('frontend_developer'):
            emp = team_assignments['frontend_developer']
            update_employee_status(cursor, conn, emp['id'], 'Busy')
            assignments.append(('frontend', project_id, emp['id']))
        if team_assignments.get('backend_developer'):
            emp = team_assignments['backend_developer']
            update_employee_status(cursor, conn, emp['id'], 'Busy')
            assignments.append(('backend', project_id, emp['id']))
        for emp in team_assignments.get('aiml_engineers', []):
            update_employee_status(cursor, conn, emp['id'], 'Busy')
            assignments.append(('aiml', project_id, emp['id']))
        
        for role, proj_id, emp_id in assignments:
            cursor.execute(
                "INSERT INTO assigned_projects (project_id, employee_id, role, assigned_at) VALUES (%s, %s, %s, NOW())", 
                (proj_id, emp_id, role)
            )
        conn.commit()
        cursor.close()
        conn.close()
        
        response_assignments = {
            "frontend_developer": clean_employee(team_assignments.get('frontend_developer')),
            "backend_developer": clean_employee(team_assignments.get('backend_developer')),
            "aiml_engineers": [clean_employee(emp) for emp in team_assignments.get('aiml_engineers', [])]
        }
        return jsonify({"message": "Team assignments updated successfully", "assignments": response_assignments})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Configure logging for better debugging
logging.basicConfig(level=logging.INFO)

# Create a folder to store uploaded files
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file types for uploads
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to add the interview event to the Google Calendar
def add_event_to_calendar(candidate_name, candidate_email, interview_date, interview_time, slot):
    try:
        SCOPES = ["https://www.googleapis.com/auth/calendar"]
        
        # Ensure the token file exists
        if not os.path.exists("token.pkl"):
            raise FileNotFoundError("Token file not found. Please authenticate first.")
        
        with open("token.pkl", "rb") as token_file:
            creds = pickle.load(token_file)

        service = build("calendar", "v3", credentials=creds)

        start_time = datetime.strptime(f"{interview_date} {interview_time}", "%Y-%m-%d %H:%M")
        end_time = start_time + timedelta(minutes=slot)

        event = {
            "summary": f"Interview with {candidate_name}",
            "location": "Virtual / Office",
            "description": f"Your interview at WeHack is scheduled.",
            "start": {"dateTime": start_time.isoformat(), "timeZone": "Asia/Kolkata"},
            "end": {"dateTime": end_time.isoformat(), "timeZone": "Asia/Kolkata"},
            "attendees": [{"email": candidate_email}],
            "reminders": {
                "useDefault": False,
                "overrides": [{"method": "email", "minutes": 30}, {"method": "popup", "minutes": 10}],
            },
        }

        event = service.events().insert(calendarId="primary", body=event).execute()
        logging.info(f"✅ Interview event created: {event.get('htmlLink')}")
    except Exception as e:
        logging.error(f"Error creating calendar event for {candidate_name}: {e}")

# Function to schedule interview slots
def schedule_slots(start, slot, break_time, candids):
    try:
        start_time = datetime.strptime(start, "%Y-%m-%d %H:%M")
        interview_start = start_time.replace(hour=9, minute=0)
        interview_end = start_time.replace(hour=16, minute=0)
        lunch_start = start_time.replace(hour=12, minute=30)
        lunch_end = lunch_start + timedelta(minutes=break_time)
        
        current_time = interview_start
        day_count = 1
        schedule = []
        
        for _, row in candids.iterrows():
            if current_time >= interview_end:
                day_count += 1
                current_time = current_time.replace(hour=9, minute=0) + timedelta(days=1)

            if lunch_start <= current_time < lunch_end:
                current_time = lunch_end

            end_slot = current_time + timedelta(minutes=slot)
            
            if end_slot > interview_end:
                day_count += 1
                current_time = current_time.replace(hour=9, minute=0) + timedelta(days=1)
                end_slot = current_time + timedelta(minutes=slot)
            
            schedule.append(end_slot.strftime("%Y-%m-%d %H:%M"))
            candids.at[_, 'Day'] = day_count
            current_time = end_slot
        
        candids['alloted'] = schedule
        return candids
    except Exception as e:
        logging.error(f"Error scheduling slots: {e}")
        return pd.DataFrame()  # Return empty DataFrame in case of error

# Function to send interview emails
def send_emails(candidates, slot):
    sender_email = "wehack060@gmail.com"
    sender_password = "zdtx uxkr uihg wvlo"  # Use an App Password if needed
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)

        for _, row in candidates.iterrows():
            recipient_email = row['Email']
            name = row['Name']
            interview_date = row["alloted"][:10].strip()
            interview_time = row["alloted"][10:].strip()

            msg = MIMEMultipart()
            
            # Add Unique ID to Subject to Prevent Auto-Quoting
            unique_id = datetime.now().strftime("%Y%m%d%H%M%S")
            subject = f"Your Interview at WeHack is Scheduled 🚀 [Ref: {unique_id}]"

            # Email Body (HTML format to prevent quoting)
            body = f'''
            <html>
            <body>
                <p>Dear {name},</p>
                <p>We are absolutely thrilled to inform you that after reviewing your application, 
                we have selected you to move forward in the hiring process at <b>WeHack</b>! 🎯</p>

                <p><b>📅 Date:</b> {interview_date}<br>
                <b>⏰ Time:</b> {interview_time}<br>
                <b>📍 Mode:</b> Lupin</p>

                <p>This interview is a fantastic opportunity for us to discuss your potential role at WeHack. 
                We can't wait to hear about your experiences, ideas, and most importantly, what excites you about this position! 🚀💡</p>

                <p>✅ Please ensure that you are available at the scheduled time. If you have any questions, 
                need to reschedule, or require any assistance, feel free to reach out—we're happy to help!</p>

                <p>Looking forward to an engaging conversation with you. Be yourself, stay confident, and let your passion shine! ✨</p>

                <p>&nbsp;</p>  <!-- Invisible space to prevent auto-quoting -->

                <p>Best regards,<br>
                🔥 Katappa<br>
                🔪 The Betrayer<br>
                🏢 WeHack Organization<br>
                📞 [Your Contact Information]</p>
            </body>
            </html>
            '''

            msg['From'] = sender_email
            msg['To'] = recipient_email
            msg['Subject'] = subject
            msg['Content-Transfer-Encoding'] = "8bit"  # Prevents encoding issues
            
            msg.attach(MIMEText(body, 'html'))  # HTML format to prevent quoting

            server.sendmail(sender_email, recipient_email, msg.as_string())
            print(f"✅ Email sent to {name} ({recipient_email})")

            # Call function to add calendar event
            add_event_to_calendar(name, recipient_email, interview_date, interview_time,slot)

            time.sleep(2)  # Add delay to prevent spam detection

        server.quit()
        print("✅ All emails have been sent successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        server.quit()

# API endpoint to schedule interviews
@app.route('/api/schedule', methods=['POST'])
def schedule_interviews():
    try:
        data = request.form
        start_time = data.get('start_date')
        slot_length = int(data.get('slot_length'))
        break_time = int(data.get('break_time'))
        
        # Check if file exists and is allowed
        file = request.files.get('file')
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file or no file provided'}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        candidates = pd.read_csv(file_path)
        scheduled_candidates = schedule_slots(start_time, slot_length, break_time, candidates)
        send_emails(scheduled_candidates,slot_length)

        # Return the URL for downloading the file
        download_url = f'http://localhost:5000/{filename}'
        return jsonify({'message': 'Interviews scheduled successfully!', 'file_url': download_url})
    except Exception as e:
        logging.error(f"Error scheduling interviews: {e}")
        return jsonify({'error': 'Failed to schedule interviews'}), 500

if __name__== "__main__":
    print("Starting Flask app in debug mode...")
    app.run(debug=True)