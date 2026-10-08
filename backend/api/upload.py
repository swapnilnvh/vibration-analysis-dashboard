from fastapi import APIRouter, UploadFile, File, HTTPException, status
from models.schemas import UploadResponse, ErrorResponse
from services.file_parser import store_dataset, generate_sample_dataset
from utils.validation import FileValidationError

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("", response_model=UploadResponse, responses={400: {"model": ErrorResponse}})
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and validate a LabVIEW Throughput .txt file.
    Validates: 6 numeric columns, timestamps, intervals, sampling rate.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": "No file uploaded or filename missing."}
        )

    try:
        content = await file.read()
        res = store_dataset(content, file.filename)
        return UploadResponse(**res)
    except FileValidationError as fve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": True, "message": fve.message, "details": fve.details}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": True, "message": f"Server processing error: {str(e)}"}
        )


@router.post("/sample", response_model=UploadResponse)
async def load_sample():
    """
    Generates and loads a realistic 6,400-sample LabVIEW NVH throughput dataset
    ready for instant analysis across all dashboard features.
    """
    try:
        res = generate_sample_dataset()
        return UploadResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": True, "message": f"Could not load sample dataset: {str(e)}"}
        )
