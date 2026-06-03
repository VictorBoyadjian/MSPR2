import time
from colorama import init

from color_enum import ColorEnum

class MessageRenderer():
    @staticmethod
    def pulling_message(stream : object, required_model):
        init()
        
        past_status = ""
        chunk_start_time = time.time()
        chunk_past_downloaded = 0
        refresh_time = 0.3
        last_print_time = time.time()
        done = False
        
        for chunk in stream:
            current_time =  time.time()

            if current_time - last_print_time < refresh_time and not done:
                continue

            status = chunk.status
            completed = chunk.completed
            total = chunk.total
            
            if status and completed and total:
                last_print_time = current_time
                percent = round((int(completed) / int(total)) * 100, 2)
            
                if status != past_status:
                    if past_status:
                        done = False
                        print(end="")
                    past_status = chunk.status
                    chunk_start_time = current_time 

                print('\r' + " "*150, end="")

                if completed < total:
                    speed = round(((completed - chunk_past_downloaded) / (1024 * 1024)) * (1 / refresh_time), 2)
                    print(
                        f"\r{ColorEnum.INFO.format('[INFO]')} : {status} -> "
                        f"{round(completed / 1073741824, 3)}/{round(total / 1073741824, 3)}Go | "
                        f"{percent}% | {speed}Mb/s | {round(current_time - chunk_start_time, 2)}s", 
                        end=""
                    )

                    chunk_past_downloaded = completed
                elif completed >= total and not done:
                    print(f"\r{ColorEnum.INFO.format('[INFO]')} : {status} -> pull complete {ColorEnum.CHECK_MARK.format('✔')}")
                    chunk_past_downloaded = 0
                    done = True
                else:
                    continue
                
        print(f"\r{ColorEnum.INFO.format('[INFO]')} : {required_model} -> pull complete {ColorEnum.CHECK_MARK.format('✔')}")