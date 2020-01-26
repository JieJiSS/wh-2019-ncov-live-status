cd "$(dirname $0)"
nohup node index.js 1>./log.log 2>&1 &
