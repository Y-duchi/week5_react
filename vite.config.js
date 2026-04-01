import { defineConfig } from 'vite';

/**
 * 개발 서버와 빌드 설정을 단순하게 유지한다.
 * 이 프로젝트는 학습용이므로 복잡한 번들 설정 대신
 * 기본 Vite 동작만 사용한다.
 */
export default defineConfig({
  server: {
    port: 5173,
    open: false,
  },
});
