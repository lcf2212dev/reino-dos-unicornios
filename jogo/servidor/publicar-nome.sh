#!/bin/sh
# Anuncia reinodosunicornios.local na rede com o IP atual do PC.
# Confere a cada 30 s: se o IP mudar, anuncia de novo com o novo.
NOME=reinodosunicornios.local
PID= ; ATUAL=
ip_atual() { ip route get 1.1.1.1 2>/dev/null | sed -n 's/.* src \([0-9.]*\).*/\1/p'; }
trap '[ -n "$PID" ] && kill $PID; exit 0' TERM INT
while true; do
  IP=$(ip_atual)
  if [ "$IP" != "$ATUAL" ] || { [ -n "$PID" ] && ! kill -0 $PID 2>/dev/null; }; then
    [ -n "$PID" ] && kill $PID 2>/dev/null
    PID= ; ATUAL=$IP
    if [ -n "$IP" ]; then
      avahi-publish -a -R "$NOME" "$IP" & PID=$!
      echo "$NOME -> $IP"
    fi
  fi
  sleep 30
done
