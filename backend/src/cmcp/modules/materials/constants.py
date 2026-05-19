# src/cmcp/modules/materials/constants.py

ERR_MATERIAL_NOT_FOUND = "Material not found."
ERR_COURSE_NOT_FOUND = "Course not found."
ERR_CHAPTER_NOT_FOUND = "Chapter not found."
ERR_CHAPTER_NOT_IN_COURSE = "Chapter does not belong to this course."

ERR_MATERIAL_TITLE_EXISTS = "Material with this title already exists in this course/chapter."
ERR_MATERIAL_TYPE_REQUIRED = "Material type is required."
ERR_MATERIAL_COUNTS_CONFLICT = "Provide only one of page_count or slide_count based on material type."
ERR_COURSE_OFFERING_NOT_FOUND = "Course offering not found or not enabled."
ERR_SLIDES_REQUIRE_SLIDE_COUNT = "Slides material must specify slide_count."
ERR_PDF_REQUIRE_PAGE_COUNT = "PDF material must specify page_count."
ERR_DOC_REQUIRE_PAGE_COUNT = "Document material must specify page_count."
ERR_LINK_INVALID_URL = "Invalid URL provided."


ERR_CHAPTER_NOT_IN_OFFERING = "Chapter does not belong to this offering."


ERR_CANNOT_CHANGE_OFFERING = "Cannot change course_offering_id after material creation."



ERR_MATERIAL_FILE_SIZE_INVALID = "Invalid file size."
ERR_FILE_SIZE_TOO_LARGE = "File size exceeds maximum limit of 100MB."
ERR_FILE_SIZE_NEGATIVE = "File size cannot be negative."

ERR_MATERIAL_TITLE_REQUIRED = "Title is required."
ERR_MATERIAL_TITLE_TOO_LONG = "Title is too long."
ERR_MATERIAL_OBJECTIVES_INVALID = "learning_objectives must be a list of strings."

ERR_PAGE_COUNT_MIN = "Page count must be at least 1."
ERR_SLIDE_COUNT_MIN = "Slide count must be at least 1."

ERR_CANNOT_CHANGE_COURSE = "Cannot change course after material creation."
ERR_CANNOT_CHANGE_CHAPTER = "Cannot change chapter after material creation."
ERR_CANNOT_CHANGE_TYPE = "Cannot change material type after creation."

ERR_MATERIAL_HAS_INTERACTIONS = "Cannot delete material with user interactions. Consider disabling it instead."
ERR_MATERIAL_MISMATCH_TYPE_META = "Metadata mismatch: Cannot set page count for video/slides or slide count for documents."
ERR_FILE_REQUIRED_FOR_TYPE = "File upload is required for this material type."
ERR_FILE_TYPE_NOT_ALLOWED = "Uploaded file type not allowed for this material type."
RR_MATERIAL_TYPE_REQUIRED = "Material type is required."
ERR_MATERIAL_TYPE_INVALID = "Invalid material type. Allowed: slides, pdf, doc, video, link, other."
ERR_LEARNING_OBJECTIVES_INVALID = "learning_objectives must be a list of strings."

ERR_TOO_MANY_MATERIALS = "Cannot process more than 50 materials in one request."
ERR_DUPLICATE_IDS = "Duplicate material IDs are not allowed."
ERR_INVALID_MISSING_ACTION = "missing_action must be 'disable', 'delete', or 'keep'."
ERR_PERMANENT_REQUIRED = "Hard delete requires permanent=true."
# =========================================================
# CONFIGURATION
# =========================================================
MAX_FILE_SIZE_MB = 100.0
MAX_MATERIALS_PER_REQUEST = 50
MAX_TITLE_LENGTH = 200

# ✅ per-material-type allowed extensions
ALLOWED_EXTENSIONS_BY_TYPE = {
    "slides": {".ppt", ".pptx", ".key"},
    "pdf": {".pdf"},
    "doc": {".doc", ".docx"},
    "video": {".mp4", ".mkv", ".mov"},
    "link": set(),   # no file needed
    "other": set(),  # allow any globally-allowed ext (we’ll treat as “skip type check”)
}