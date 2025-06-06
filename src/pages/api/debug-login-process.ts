import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcrypt';
import { sessionOptions, SessionUser } from '@/lib/session';

const ADMIN_USER = 'admin';
const ADMIN_HASH = '$2b$10$1Z3MThBzrcPUfxfTaANFEeEUH0/9Z8eIwhbGGHDSyCk1pGhgEMnDe';

export default async function debugLoginProcess(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('1. Starting login debug process');
    
    // Check request method
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed', 
        method: req.method,
        step: 'method_check'
      });
    }
    
    console.log('2. Method check passed');
    
    // Check request body
    const { username, password } = req.body;
    console.log('3. Request body:', { username, passwordLength: password?.length });
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing username or password',
        hasUsername: !!username,
        hasPassword: !!password,
        step: 'body_validation'
      });
    }
    
    console.log('4. Body validation passed');
    
    // Create session
    let session;
    try {
      session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions);
      console.log('5. Session created successfully');
    } catch (sessionError) {
      console.error('5. Session creation failed:', sessionError);
      return res.status(500).json({ 
        error: 'Session creation failed',
        details: sessionError instanceof Error ? sessionError.message : String(sessionError),
        step: 'session_creation'
      });
    }
    
    // Check username
    if (username !== ADMIN_USER) {
      console.log('6. Username check failed:', { provided: username, expected: ADMIN_USER });
      return res.status(404).json({ 
        message: 'Username not found',
        step: 'username_validation'
      });
    }
    
    console.log('6. Username check passed');
    
    // Test bcrypt
    let passwordMatch;
    try {
      console.log('7. Testing bcrypt compare...');
      passwordMatch = await bcrypt.compare(password, ADMIN_HASH);
      console.log('7. Bcrypt compare result:', passwordMatch);
    } catch (bcryptError) {
      console.error('7. Bcrypt error:', bcryptError);
      return res.status(500).json({ 
        error: 'Password comparison failed',
        details: bcryptError instanceof Error ? bcryptError.message : String(bcryptError),
        step: 'bcrypt_compare'
      });
    }
    
    if (!passwordMatch) {
      console.log('8. Password check failed');
      return res.status(401).json({ 
        message: 'Incorrect password',
        step: 'password_validation'
      });
    }
    
    console.log('8. Password check passed');
    
    // Save session
    try {
      session.user = { 
        isLoggedIn: true, 
        username,
        role: 'admin',
        email: 'admin@company.com', 
        status: 'active',
        id: 'admin-user'
    };
      await session.save();
      console.log('9. Session saved successfully');
    } catch (saveError) {
      console.error('9. Session save failed:', saveError);
      return res.status(500).json({ 
        error: 'Session save failed',
        details: saveError instanceof Error ? saveError.message : String(saveError),
        step: 'session_save'
      });
    }
    
    console.log('10. Login process completed successfully');
    return res.status(200).json({ 
      message: 'Logged in successfully',
      step: 'success'
    });
    
  } catch (error) {
    console.error('Unexpected error in login debug:', error);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      step: 'unexpected_error'
    });
  }
}