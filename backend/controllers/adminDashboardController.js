const User = require('../models/User');
const SignupRequest = require('../models/SignupRequest');


const adminDashboardController = {

    // GET /api/admin/signup-requests - Get all pending signup requests

    async getSigupRequests(req, res) {

        try {
            console.log("fetching signup requests");

            const requests = await SignupRequest.find({ status: 'pending' }).sort({ createdAt: -1 }).select('-__v');

            res.json({
                success: true,
                message: "Signup requests fetched successfully",
                data: {
                    requests,
                    count: requests.length
                }
            });
        } catch (err) {
            console.error('error in fetching the  signup requests', err);
            res.status(500).json({
                success: false,
                message: 'internal server error'
            });
        }
    },

    // GET /api/admin/signup-requests/all - Get all signup requests (pending, approved, rejected)

    async getAllSignupRequests(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;

            let filter = {};
            if (status && ['pending', 'approved', 'rejected'].includes(status)) {
                filter.status = status;
            }

            const skip = (page - 1) * limit;

            const requests = await SignupRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v');

            const total = await SignupRequest.countDocuments(filter);

            res.json({
                success: true,
                message: "All signup requests fetched successfully",
                data: {
                    requests,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(total / limit),
                        total_requests: total,
                        per_page: parseInt(limit),
                    }
                }
            });
        } catch (err) {
            console.error('error in fetching the  signup requests', err);
            res.status(500).json({
                success: false,
                message: 'internal server error'
            });
        }
    },

    // POST /api/admin/signup-requests/:id/approve - Approve a signup request

    async approveSignupRequest(req, res) {
        try {
            const { id } = req.params;
            console.log('approve signup request for ID:', id);
            
            const requests = await SignupRequest.findById(id);
            console.log('Found request:', requests);
            
            if (!requests) {
                return res.status(404).json({
                    success: false,
                    message: "Signup request not found"
                });
            }

            if (requests.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Request is already ${requests.status}`
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: requests.email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists"
                });
            }

            // Create new user - votre SignupRequest n'a que l'email
            // Donc on génère les autres champs
            const emailUsername = requests.email.split('@')[0];
            
            const newUser = new User({
                name: emailUsername,  // Utilise la partie avant @ de l'email
                email: requests.email,
                password: 'TempPassword123!', // Mot de passe temporaire
                role: 'client',
                firstName: emailUsername,
                lastName: '',
                phone: '',
                organization: ''
            });

            console.log('Creating user with data:', {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            });

            await newUser.save();

            // Update request status
            requests.status = 'approved';
            requests.approvedAt = new Date();
            await requests.save();

            console.log('Signup request approved successfully');
            res.json({
                success: true,
                message: "Signup request approved successfully",
                data: {
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    },
                    request: requests
                }
            });

        } catch (err) {
            console.error('Error in approving signup request:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                debug: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    },


    // POST /api/admin/signup-requests/:id/reject - Reject a signup request

    async rejectSignupRequest(req, res) {
        try {
            const { id } = req.params;
            console.log('reject signup request');

            const requests = await SignupRequest.findById(id);
            if (!requests) {
                return res.status(404).json({
                    success: false,
                    message: "Signup request not found"
                });
            }

            if (requests.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Request is already ${SignupRequest.status}`
                });
            }


            requests.status = 'rejected';
            requests.rejectedAt = Date.now();
            await requests.save();

            console.log('Signup request rejected successfully');

            res.json({
                success: true,
                message: "Signup request rejected successfully",
                data: {
                    request: SignupRequest
                }
            });

        } catch (err) {
            console.error('error in rejecting the signup request', err);
            res.status(500).json({
                success: false,
                message: 'internal server error'
            });
        }
    },

    // GET /api/admin/stats - Ge dashboard stats 

    async getDashboardStats(req, res) {
        try {
            console.log('fetching dashboard stats');
            const [
                totalUsers,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                recentRequests  // Ajoutez cette variable manquante
            ] = await Promise.all([
                User.countDocuments(),
                SignupRequest.countDocuments({ status: 'pending' }),
                SignupRequest.countDocuments({ status: 'approved' }),
                SignupRequest.countDocuments({ status: 'rejected' }),
                SignupRequest.find().sort({ createdAt: -1 }).limit(5).select('username email role status createdAt')
            ]);

            res.json({
                success: true,
                message: 'Dashboard stats retrieved successfully',
                data: {
                    stats: {
                        total_users: totalUsers,
                        pending_requests: pendingRequests,
                        approved_requests: approvedRequests,
                        rejected_requests: rejectedRequests,
                        total_requests: pendingRequests + approvedRequests + rejectedRequests
                    },
                    recent_requests: recentRequests
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },


    // GET /api/admin/users - Get all users

    async getAllUsers(req, res) {
        try {
            console.log('fetching users');
            const { role, page = 1, limit = 10 } = req.query;

            let filter = {};
            if (role && ['admin', 'Directeur technique', 'Directeur generale', 'Directeur administratif', 'Technicien', 'chef de projet'].includes(role)) {
                filter.role = role;
            }

            const skip = (page - 1) * limit;
            const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -__v');
            const total = await User.countDocuments(filter);

            res.json({
                success: true,
                message: 'Users fetched successfully',
                data: {
                    users,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_users: total,
                        per_page: parseInt(limit)
                    }
                }
            });

        } catch (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}; 

module.exports = adminDashboardController;