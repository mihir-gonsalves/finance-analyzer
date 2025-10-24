# app/api/analytics/__init__.py
from fastapi import APIRouter
from .core import router as core_router
from .time_series import router as time_router
from .trends import router as trends_router

router = APIRouter(prefix="/analytics", tags=["analytics"])
router.include_router(core_router)
router.include_router(time_router)
router.include_router(trends_router)
