/**
 * Unit tests for NextAuth configuration files
 * 
 * Validates that the NextAuth configuration files are properly created
 * and structured according to Forgrin requirements.
 * 
 * Requirements: 1.2, 13.2
 */

import fs from 'fs';
import path from 'path';

describe('NextAuth Configuration Files', () => {
  it('should have auth.ts configuration file', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    expect(fs.existsSync(authPath)).toBe(true);
  });

  it('should have NextAuth API route handler', () => {
    const routePath = path.join(
      process.cwd(),
      'app',
      'api',
      'auth',
      '[...nextauth]',
      'route.ts'
    );
    expect(fs.existsSync(routePath)).toBe(true);
  });

  it('should have NextAuth type definitions', () => {
    const typesPath = path.join(process.cwd(), 'types', 'next-auth.d.ts');
    expect(fs.existsSync(typesPath)).toBe(true);
  });

  it('auth.ts should export authOptions', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('export const authOptions');
  });

  it('auth.ts should configure JWT session strategy', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain("strategy: 'jwt'");
  });

  it('auth.ts should configure secure cookies', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('httpOnly: true');
    expect(content).toContain("sameSite: 'lax'");
  });

  it('auth.ts should configure credentials provider', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('CredentialsProvider');
  });

  it('auth.ts should use bcrypt for password verification', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('bcrypt.compare');
  });

  it('auth.ts should configure Prisma adapter', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('PrismaAdapter');
  });

  it('auth.ts should have JWT callback', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('async jwt({');
  });

  it('auth.ts should have session callback', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('async session({');
  });

  it('auth.ts should use NEXTAUTH_SECRET from environment', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('process.env.NEXTAUTH_SECRET');
  });

  it('route.ts should export GET and POST handlers', () => {
    const routePath = path.join(
      process.cwd(),
      'app',
      'api',
      'auth',
      '[...nextauth]',
      'route.ts'
    );
    const content = fs.readFileSync(routePath, 'utf-8');
    expect(content).toContain('export { handler as GET, handler as POST }');
  });

  it('route.ts should import authOptions', () => {
    const routePath = path.join(
      process.cwd(),
      'app',
      'api',
      'auth',
      '[...nextauth]',
      'route.ts'
    );
    const content = fs.readFileSync(routePath, 'utf-8');
    expect(content).toContain("from '@/lib/auth'");
  });

  it('type definitions should extend User interface', () => {
    const typesPath = path.join(process.cwd(), 'types', 'next-auth.d.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('interface User');
    expect(content).toContain('subscriptionTier');
    expect(content).toContain('workspaceId');
  });

  it('type definitions should extend Session interface', () => {
    const typesPath = path.join(process.cwd(), 'types', 'next-auth.d.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('interface Session');
  });

  it('type definitions should extend JWT interface', () => {
    const typesPath = path.join(process.cwd(), 'types', 'next-auth.d.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('interface JWT');
  });
});

describe('NextAuth Security Configuration', () => {
  it('should enforce httpOnly cookies', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('httpOnly: true');
  });

  it('should enforce sameSite for CSRF protection', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain("sameSite: 'lax'");
  });

  it('should enforce secure cookies in production', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain("process.env.NODE_ENV === 'production'");
  });

  it('should validate credentials before authentication', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('!credentials?.email');
  });

  it('should use secure password comparison', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('bcrypt.compare');
  });
});

describe('NextAuth Session Configuration', () => {
  it('should set session max age to 30 days', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('maxAge: 30 * 24 * 60 * 60');
  });

  it('should include user data in JWT token', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('token.id = user.id');
    expect(content).toContain('token.email = user.email');
    expect(content).toContain('token.subscriptionTier = user.subscriptionTier');
  });

  it('should populate session from JWT token', () => {
    const authPath = path.join(process.cwd(), 'lib', 'auth.ts');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toContain('session.user.id = token.id');
    expect(content).toContain('session.user.email = token.email');
  });
});
