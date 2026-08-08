# status

`status.ryuwon.me`에 올리는 공개 상태 페이지다.

일부러 작게 둔다.

- ConfigMap에서 정적 파일을 마운트한다.
- 공개 `nginxinc/nginx-unprivileged` 이미지를 쓴다.
- 데이터베이스와 PVC는 두지 않는다.
- Kubernetes API 토큰은 마운트하지 않는다.
- 브라우저에서 공개 주소 접속 여부만 확인한다.

사설 IP, 노드명, 저장소 정보, 로그, 내부 장애 원인은 공개하지 않는다.
