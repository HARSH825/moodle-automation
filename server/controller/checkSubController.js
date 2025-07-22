import { addAssignmentCheckJob, getJobStatus } from '../services/queueManager.js';
import supabase from '../config/supabase.js';

export const startAssignmentCheck = async (req, res) => {
    const { username, selectedCourseIds } = req.body;

    console.log("Assinment check started");
    console.log("usernme : "+username +" selected : "+selectedCourseIds);
    if (!username || !selectedCourseIds || !Array.isArray(selectedCourseIds)) {
        return res.status(400).json({
            success: false,
            error: 'Username and selectedCourseIds array are required'
        });
    }
    
    try {
        const job = await addAssignmentCheckJob(username, selectedCourseIds);
        
        res.json({ 
            success: true,
            jobId: job.id,
            message: `Assignment checking queued for ${selectedCourseIds.length} courses`,
            selectedCourses: selectedCourseIds.length
        });
        
    } catch (error) {
        console.error('Flow 2 start error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to queue assignment checking'
        });
    }
};

// get job status
export const checkJobStatus = async (req, res) => {
    const { jobId } = req.params;
    
    try {
        const status = await getJobStatus(jobId);
        
        if (!status) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }
        
        res.json({
            success: true,
            job: status
        });
        
    } catch (error) {
        console.error('Job status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get job status'
        });
    }
};

// get non-sub assignments 
export const getNonSubmittedAssignments = async (req, res) => {
    const { username } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('course_assignments')
            .select('*')
            .eq('username', username)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const nonSubmittedData = {};
        data.forEach(row => {
            nonSubmittedData[row.course_id] = row.assignment_data;
        });
        
        res.json({
            success: true,
            nonSubmittedAssignments: nonSubmittedData,
            coursesFound: data.length
        });
        
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assignments'
        });
    }
};
