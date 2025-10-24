# app/api/transactions/__init__.py
from fastapi import APIRouter
from .core import router as core_router
from .admin import router as admin_router
from .meta import router as meta_router

router = APIRouter(prefix="/transactions", tags=["transactions"])
router.include_router(core_router)
router.include_router(admin_router)
router.include_router(meta_router)
