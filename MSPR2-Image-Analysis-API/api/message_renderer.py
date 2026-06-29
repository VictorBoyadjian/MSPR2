#Libs
import time
from colorama import init

#Modules
from color_enum import ColorEnum
from logs_service import LogService

class MessageRenderer():
    @staticmethod
    def pulling_message(stream : object, required_model):
      try:
        init()

        start_time = time.time()
        past_status = ""
        chunk_start_time = time.time()
        chunk_past_downloaded = 0
        refresh_time = 0.1
        last_print_time = time.time()
        done = False
        last_mbs = []
        last_remining_s = 0
        
        for chunk in stream:
            current_time =  time.time()

            if current_time - last_print_time < refresh_time and not done:
                continue

            status = chunk.status
            completed = chunk.completed
            total = chunk.total
            
            if status and completed and total:
                last_print_time = current_time
                percent = (int(completed) / int(total)) * 100
            
                if status != past_status:
                    if past_status:
                        done = False
                        print(end="")
                    past_status = chunk.status
                    chunk_start_time = current_time 

                print('\r' + " "*150, end="")

                if completed < total:               
                    last_mbs_len = len(last_mbs)
                    if last_mbs_len >= 100:
                        last_mbs.pop(0)
                    
                    last_mbs.append(0 if chunk_past_downloaded == 0 else round(((completed - chunk_past_downloaded) / (1024 * 1024)) * (1 / refresh_time), 2))
                    avg_speed = round(sum(last_mbs) / last_mbs_len if last_mbs_len != 0 else 1, 2)

                    if round(current_time - start_time) % 10 == 0:
                        last_remining_s = total / (1024 * 1024) / avg_speed
                    
                    print(
                        f"\r{ColorEnum.INFO.format('[INFO]')} : {status} -> "
                        f"{completed / 1073741824:.2f}/{total / 1073741824:.2f}Go | "
                        f"{percent:.2f}% | {avg_speed:.2f}Mb/s | "
                        f"{ColorEnum.TIME.format(f'{(current_time - chunk_start_time):.2f}s')} / "
                        f"~{ColorEnum.TIME.format(f'{last_remining_s:.2f}s')}",
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
      except Exception as e:
        LogService.send_log(e)