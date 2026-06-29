#Libs
from colorama import Fore
from enum import Enum

#Modules
from logs_service import LogService

class ColorEnum(Enum):
    INFO = 'Info'
    ERROR = 'Error'
    WARNING = 'Warning'
    CHECK_MARK = 'CheckMark'
    MODEL = 'Model'
    TIME = 'Time'

    def format(self, value : str) -> str:
        try:
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
            if self == ColorEnum.TIME:
                return f'{Fore.BLUE}{value}{Fore.RESET}'
        except Exception as e:
            LogService.send_log(e)
            return value