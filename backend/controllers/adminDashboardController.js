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
            console.log('approve signup request');

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

            // cheking if the user already exists 
            const existingUser = await User.findOne({ email: SignupRequest.email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists"
                });
            }


            // creating a new user 
            const newUser = new User({
                username: SignupRequest.username,
                email: SignupRequest.email,
                password: SignupRequest.password,
                role: SignupRequest.role || 'client',
                fistName: SignupRequest.name
            });
            await newUser.save();

            SignupRequest.status = 'approved';
            SignupRequest.approvedAt = Date.now();
            await SignupRequest.save();

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
                    request: SignupRequest
                }
            });
        } catch (err) {
            console.error('error in approving the signup request', err);
            res.status(500).json({
                success: false,
                message: 'internal server error'
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


            SignupRequest.status = 'rejected';
            SignupRequest.rejectedAt = Date.now();
            await SignupRequest.save();

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


    async getDashboardStats(req, res) {
        try {
            console.log('fetching dashboard stats');

            const [
                totalUsers,
                pendingRequests,
                approvedRequests,
                rejectedRequests
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