import serial
import asyncio
import time
MENU= \
"""
1. Send characters
2. Read characters
3. Quit
"""
class SerialEcho(object):
    EMPTY_BUFFSTR = "No bytes on buffer"
    def __init__(self,tty,null_zero=True):
        self.ser = serial.Serial(tty,timeout=3)
        self.null_zero = null_zero
        self.polling = False

    def send_chars(self,chars,use_end=True):
        self.ser.write(chars.encode('ascii'))
        if(use_end and self.null_zero):
            self.ser.write('\0'.encode('ascii'))

    def recieve_chars(self):
        if(self.ser.in_waiting):
            return self.ser.read(self.ser.in_waiting).decode('ascii')
        else:
            return SerialEcho.EMPTY_BUFFSTR

    def close(self):
        self.ser.close()

def main(device):
    ser = SerialEcho(device)
    opt = ''
    while(opt != '3'):
        opt = input(MENU)
        if(opt == '1'):
            ser.send_chars(input("Enter characters:"))
        elif(opt == '2'):
            print(ser.recieve_chars())

    ser.close()        
if __name__ == '__main__':
    import sys
    main(sys.argv[1])

