"""
Database Configuration (Hybrid: Postgres for Prod, SQLite for Dev)
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Check for Vercel Postgres URL
DATABASE_URL = os.getenv("POSTGRES_URL")

if DATABASE_URL:
    # Vercel provides postgres:// but SQLAlchemy needs postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Postgres Connection
    engine = create_engine(DATABASE_URL)
else:
    # Local SQLite Fallback
    DATABASE_URL = "sqlite:///./hrms.db"
    # check_same_thread needed for SQLite
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
