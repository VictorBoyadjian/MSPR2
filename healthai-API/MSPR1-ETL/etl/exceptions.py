class InvalidFileFormatError(Exception):
    def __init__(self, file_path: str, message: str = "Format non supporté."):
        self.file_path = file_path
        self.message = f"{message} Fichier : {file_path}"
        super().__init__(self.message)


class SchemaValidationError(Exception):
    def __init__(self, dataset_type: str, missing_columns: list[str]):
        self.dataset_type = dataset_type
        self.missing_columns = missing_columns
        self.message = (
            f"Validation échouée pour '{dataset_type}'. "
            f"Colonnes manquantes : {missing_columns}"
        )
        super().__init__(self.message)


class DatabaseLoadError(Exception):
    def __init__(self, table_name: str, detail: str):
        self.table_name = table_name
        self.detail = detail
        self.message = f"Erreur chargement table '{table_name}' : {detail}"
        super().__init__(self.message)
