from colorama import Fore
from enum import Enum

class ColorEnum(Enum):
    INFO = 'Info'
    ERROR = 'Error'
    WARNING = 'Warning'
    CHECK_MARK = 'CheckMark'
    MODEL = 'Model'
    
    def format(self, value : str) -> str:
        if self == ColorEnum.INFO:
            return f'{Fore.CYAN}{value}{Fore.RESET}'
        if self == ColorEnum.ERROR:
            return f'{Fore.RED}{value}{Fore.RESET}'
        if self == ColorEnum.WARNING:
            return f'{Fore.YELLOW}{value}{Fore.RESET}'
        if self == ColorEnum.CHECK_MARK:
            return f'{Fore.GREEN}{value}{Fore.RESET}'
        if self == ColorEnum.MODEL:
            return f'{Fore.YELLOW}{value}{Fore.RESET}'