import { addDocumentGenJob, getDocumentJobStatus } from '../services/docQueueManager.js';

export const startDocumentGeneration = async (req, res) => {
    const { username, selectedAssignments, userDetails } = req.body;
    
    if (!username || !selectedAssignments || !Array.isArray(selectedAssignments)) {
        return res.status(400).json({
            success: false,
            error: 'Username and selectedAssignments array are required'
        });
    }
    
    if (selectedAssignments.length > 5) {
        return res.status(400).json({
            success: false,
            error: 'Maximum 5 assignments allowed per request'
        });
    }
    
    if (selectedAssignments.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'At least 1 assignment must be selected'
        });
    }
    
    try {
        const job = await addDocumentGenJob(username, selectedAssignments, userDetails || {});
        
        res.json({
            success: true,
            jobId: job.id,
            message: `Document generation queued for ${selectedAssignments.length} assignments`,
            selectedAssignments: selectedAssignments.length,
            estimatedTime: `${selectedAssignments.length * 2-3} minutes`
        });
        
    } catch (error) {
        console.error('Flow 3 start error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to queue document generation'
        });
    }
};

export const checkDocumentJobStatus = async (req, res) => {
    const { jobId } = req.params;
    
    try {
        const status = await getDocumentJobStatus(jobId);
        
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
        console.error('Document job status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get job status'
        });
    }
};
