import { defineConfig } from 'vitest/config';

/**
 * jsdom 환경에서 DOM 기반 테스트를 실행하기 위한 설정이다.
 * 앱과 렌더러가 실제 브라우저 DOM API를 사용하므로
 * Node 환경이 아닌 jsdom 환경이 필요하다.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
  },
});
