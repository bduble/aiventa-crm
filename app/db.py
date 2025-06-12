# app/db.py
from dotenv import load_dotenv
load_dotenv()            # ← make sure this is *before* any os.environ[...] uses

import os
from supabase import create_client

SUPABASE_URL = os.environ["https://ckdwsvviiuhyqzroswfe.supabase.co"]
SUPABASE_KEY = os.environ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZHdzdnZpaXVoeXF6cm9zd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTczODgsImV4cCI6MjA2NTA3MzM4OH0.eKOoMaiI6btiJS343Z3-x9ecLwY8MrkVVYY7JoiMI3I"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
