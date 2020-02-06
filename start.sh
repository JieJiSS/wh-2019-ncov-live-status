cd "$(dirname $0)"
nohup node index.js --verb 1>./log.log 2>&1 &
