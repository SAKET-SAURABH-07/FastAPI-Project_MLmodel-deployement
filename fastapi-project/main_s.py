from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class MarksSubmission(BaseModel):
    student_id: str
    marks: int
    subject : str

app = FastAPI()

students = {
    "S001": {"name": "Alice", "marks": 85, "grade": "A"},
    "S002": {"name": "Bob", "marks": 75, "grade": "B"},
    "S003": {"name": "Charlie", "marks": 65, "grade": "C"},
    "S004": {"name": "Diana", "marks": 95, "grade": "A+"}

}

@app.get("/students/{student_id}")
def get_student(student_id : str):
    if student_id not in students:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found"
        )
    return students[student_id]

@app.post("/submit-marks")
def submit_marks(submission: MarksSubmission):

    if submission.student_id not in students:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {submission.student_id} not found"
        )

    if submission.marks < 0 or submission.marks > 100:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Marks must be between 0 and 100",
                "marks_received": submission.marks,
                "fix":"enter a valid value between 0 and 100"
            }
        )

    if submission.subject.strip() == "":
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Subject cannot be empty",
                "fix":"enter a valid subject name"
            }
        )
    

    try:    
        students[submission.student_id]["marks"] = submission.marks
        return {
                        "message": f"Marks for student {submission.student_id} updated successfully",
                        "student": students[submission.student_id]["name"],
                        "subject": submission.subject,
                        "marks": submission.marks
                    } 
        
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "An error occurred while updating marks",
                "exception": str(e)
            }
        )
    


    