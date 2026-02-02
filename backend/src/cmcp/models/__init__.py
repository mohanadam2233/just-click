from __future__ import annotations

import importlib
import pkgutil
from types import ModuleType
from typing import Optional

BASE_PACKAGE = "cmcp.modules"
CANDIDATES = ("models", "model")  # modules can have models.py or model.py


def _import_all_submodules_of(pkg_mod: ModuleType) -> int:
    count = 0
    if hasattr(pkg_mod, "__path__"):
        for _, subname, _ in pkgutil.walk_packages(pkg_mod.__path__, pkg_mod.__name__ + "."):
            importlib.import_module(subname)
            count += 1
    return count


def _try_import(qualname: str) -> Optional[ModuleType]:
    try:
        return importlib.import_module(qualname)
    except ModuleNotFoundError:
        return None
    except Exception as e:
        raise RuntimeError(f"Failed importing {qualname}: {e}") from e



def _import_models_for(module_pkg_qualname: str) -> int:
    for name in CANDIDATES:
        mod = _try_import(f"{module_pkg_qualname}.{name}")
        if mod:
            return 1 + _import_all_submodules_of(mod)
    return 0


def _import_under_cmcp_modules() -> int:
    root = _try_import(BASE_PACKAGE)
    if not root or not hasattr(root, "__path__"):
        return 0

    imported = 0
    for _, child_qualname, ispkg in pkgutil.iter_modules(root.__path__, BASE_PACKAGE + "."):
        if ispkg:
            imported += _import_models_for(child_qualname)
    return imported


_IMPORTED_MODELS_COUNT = _import_under_cmcp_modules()
