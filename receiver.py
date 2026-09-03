"""Remote Keyboard Windows receiver for the hosted Vercel site."""
from __future__ import annotations
import ctypes, json, secrets, struct, sys, time, urllib.error, urllib.parse, urllib.request, webbrowser
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parent / "remote-keyboard.json"
USER32 = ctypes.windll.user32 if sys.platform == "win32" else None
KEYEVENTF_KEYUP, KEYEVENTF_UNICODE = 0x0002, 0x0004
VK = {"Backspace":8,"Tab":9,"Enter":13,"Shift":16,"Control":17,"Alt":18,"Escape":27," ":32,"ArrowLeft":37,"ArrowUp":38,"ArrowRight":39,"ArrowDown":40,"Delete":46,"Meta":91}

def press_virtual_key(vk):
    USER32.keybd_event(vk,0,0,0); USER32.keybd_event(vk,0,KEYEVENTF_KEYUP,0)

def type_unicode(text):
    for char in text:
        units=struct.unpack("<HH",char.encode("utf-16-le")) if ord(char)>0xFFFF else (ord(char),)
        for unit in units:
            USER32.keybd_event(0,unit,KEYEVENTF_UNICODE,0); USER32.keybd_event(0,unit,KEYEVENTF_UNICODE|KEYEVENTF_KEYUP,0)

def execute_event(message):
    kind,value=message.get("type"),message.get("value","")
    if kind=="text" and isinstance(value,str): type_unicode(value[:1000])
    elif kind=="key" and value in VK: press_virtual_key(VK[value])
    elif kind=="shortcut" and isinstance(value,list):
        keys=[VK.get(str(key)) for key in value]
        if keys and all(keys):
            for key in keys: USER32.keybd_event(key,0,0,0)
            for key in reversed(keys): USER32.keybd_event(key,0,KEYEVENTF_KEYUP,0)

def setup():
    print("Remote Keyboard setup\n")
    while True:
        site=input("Paste your Vercel website address: ").strip().rstrip("/")
        if site.startswith("https://"): break
        print("The address must start with https://")
    config={"site":site,"device":secrets.token_urlsafe(9),"secret":secrets.token_urlsafe(32)}
    CONFIG_PATH.write_text(json.dumps(config,indent=2),encoding="utf-8")
    return config

def pairing_url(config):
    return config["site"]+"/?"+urllib.parse.urlencode({"device":config["device"],"secret":config["secret"]})

def poll(config):
    query=urllib.parse.urlencode({"device":config["device"],"secret":config["secret"]})
    request=urllib.request.Request(config["site"]+"/api/poll?"+query,headers={"User-Agent":"RemoteKeyboard-Windows/2.0","Cache-Control":"no-store"})
    with urllib.request.urlopen(request,timeout=12) as response:
        return json.loads(response.read().decode("utf-8")).get("commands",[])

def main():
    if sys.platform!="win32": raise SystemExit("This receiver must be run on Windows.")
    config=json.loads(CONFIG_PATH.read_text(encoding="utf-8")) if CONFIG_PATH.exists() else setup()
    url=pairing_url(config)
    print("\nRemote Keyboard is ready\nOpen this private pairing link on your iPad:\n"+url+"\n\nKeep this window open. Press Ctrl+C to stop.")
    webbrowser.open(url); failures=0
    try:
        while True:
            try:
                for command in poll(config): execute_event(command)
                if failures: print("Connected again.")
                failures=0; time.sleep(.18)
            except (urllib.error.URLError,TimeoutError,json.JSONDecodeError) as exc:
                failures+=1
                if failures==1: print("Waiting for website… ("+str(exc)+")")
                time.sleep(min(5,failures))
    except KeyboardInterrupt: print("\nStopped.")

if __name__=="__main__": main()
