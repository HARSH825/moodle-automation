import { handleFlow1, loginToMoodle } from '../services/loginService.js';

export const flow1Controller = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required'
        });
    }
    
    try {
        const result = await handleFlow1(username, password);
        
        if (result.success) {
            res.json({
                success: true,
                courses: result.courses,
                message: 'Authentication and course fetching completed successfully'
            });
        } else {
            res.status(401).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('Flow 1 controller error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export default flow1Controller;