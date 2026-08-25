const db = require('../config/db');

const defaultPermissionMatrix = {
  ADMIN: {
    asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: true, asset_print_qr: true,
    discovery_view: true, discovery_approve: true, discovery_reject: true,
    drift_view: true, drift_resolve: true,
    master_view: true, master_edit: true,
    iam_users: true, iam_matrix: true, system_settings: true
  },
  MANAGER: {
    asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: false, asset_print_qr: true,
    discovery_view: true, discovery_approve: true, discovery_reject: true,
    drift_view: true, drift_resolve: true,
    master_view: true, master_edit: true,
    iam_users: false, iam_matrix: false, system_settings: false
  },
  STAFF: {
    asset_view: true, asset_create: true, asset_edit: true, asset_allocate: true, asset_revoke: true, asset_maintenance: true, asset_dispose: false, asset_print_qr: true,
    discovery_view: true, discovery_approve: false, discovery_reject: false,
    drift_view: true, drift_resolve: false,
    master_view: true, master_edit: false,
    iam_users: false, iam_matrix: false, system_settings: false
  },
  VIEWER: {
    asset_view: true, asset_create: false, asset_edit: false, asset_allocate: false, asset_revoke: false, asset_maintenance: false, asset_dispose: false, asset_print_qr: false,
    discovery_view: true, discovery_approve: false, discovery_reject: false,
    drift_view: true, drift_resolve: false,
    master_view: true, master_edit: false,
    iam_users: false, iam_matrix: false, system_settings: false
  }
};

// Seed default system users in memory/DB if table is empty
const defaultSystemUsers = [
  {
    id: 1,
    username: 'admin_system',
    fullName: 'Admin System',
    email: 'admin@company.com',
    phone: '0901234567',
    employeeId: 'SYS001',
    role: 'ADMIN',
    departmentName: 'Công Nghệ Thông Tin (IT Central)',
    jobTitle: 'Quản Trị Viên Hệ Thống',
    status: 'ACTIVE',
    lastLogin: 'Vừa xong',
    authMethod: 'LOCAL'
  },
  {
    id: 2,
    username: 'manager_it',
    fullName: 'Nguyễn Văn Anh',
    email: 'anh.nguyen@company.com',
    phone: '0901234567',
    employeeId: 'EMP001',
    role: 'MANAGER',
    departmentName: 'Phòng Công nghệ thông tin',
    jobTitle: 'Trưởng Phòng IT',
    status: 'ACTIVE',
    lastLogin: 'Hôm nay, 08:30',
    authMethod: 'SSO / LDAP'
  },
  {
    id: 3,
    username: 'user_binh',
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@company.com',
    phone: '0902345678',
    employeeId: 'EMP002',
    role: 'STAFF',
    departmentName: 'Phòng Nhân sự',
    jobTitle: 'Chuyên Viên HR',
    status: 'ACTIVE',
    lastLogin: 'Hôm qua, 16:45',
    authMethod: 'SSO / LDAP'
  },
  {
    id: 4,
    username: 'user_cuong',
    fullName: 'Lê Hoàng Cường',
    email: 'cuong.le@company.com',
    phone: '0903456789',
    employeeId: 'EMP003',
    role: 'VIEWER',
    departmentName: 'Phòng Tài chính Kế toán',
    jobTitle: 'Kế Toán Trưởng',
    status: 'INACTIVE',
    lastLogin: '3 ngày trước',
    authMethod: 'LOCAL'
  },
  {
    id: 5,
    username: 'user_dung',
    fullName: 'Phạm Minh Dũng',
    email: 'dung.pham@company.com',
    phone: '0904567890',
    employeeId: 'EMP004',
    role: 'STAFF',
    departmentName: 'Phòng Marketing',
    jobTitle: 'Chuyên Viên MKT',
    status: 'ACTIVE',
    lastLogin: '1 ngày trước',
    authMethod: 'LOCAL'
  }
];

let inMemoryUsers = [...defaultSystemUsers];

let tableEnsured = false;

// Helper to ensure table exists
async function ensureTable() {
  if (tableEnsured) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        employee_id VARCHAR(50),
        role VARCHAR(50) DEFAULT 'STAFF',
        department_name VARCHAR(255),
        job_title VARCHAR(255) DEFAULT '',
        avatar_url VARCHAR(500) DEFAULT '',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        auth_method VARCHAR(50) DEFAULT 'LOCAL',
        last_login VARCHAR(100) DEFAULT 'Chưa đăng nhập',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Try adding missing columns if table already existed
    try {
      await db.query(`ALTER TABLE system_users ADD COLUMN avatar_url VARCHAR(500) DEFAULT ''`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE system_users ADD COLUMN job_title VARCHAR(255) DEFAULT ''`);
    } catch (e) {}

    // Seed default users ONLY if system_users table is completely empty
    const countRows = await db.query('SELECT COUNT(*) as cnt FROM system_users');
    const cnt = countRows && countRows[0] ? (countRows[0].cnt || countRows[0]['COUNT(*)'] || 0) : 0;
    if (parseInt(cnt, 10) === 0) {
      for (const u of defaultSystemUsers) {
        await db.query(
          `INSERT IGNORE INTO system_users (id, username, full_name, email, phone, employee_id, role, department_name, job_title, avatar_url, status, auth_method, last_login)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.username, u.fullName, u.email, u.phone, u.employeeId, u.role, u.departmentName, u.jobTitle || '', u.avatarUrl || '', u.status, u.authMethod, u.lastLogin]
        );
      }
    }
    tableEnsured = true;
  } catch (err) {
    // DB offline/mock mode
  }
}

// GET /api/users
async function getUsers(req, res) {
  try {
    await ensureTable();
    try {
      const dbRows = await db.query('SELECT * FROM system_users ORDER BY id DESC');
      if (Array.isArray(dbRows)) {
        const mapped = dbRows.map(r => ({
          id: r.id,
          username: r.username,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          employeeId: r.employee_id,
          role: r.role,
          departmentName: r.department_name,
          jobTitle: r.job_title || r.role,
          avatarUrl: r.avatar_url || '',
          status: r.status,
          authMethod: r.auth_method,
          lastLogin: r.last_login
        }));
        inMemoryUsers = mapped;
        return res.json(mapped);
      }
    } catch (e) {
      // Fallback memory
    }
    return res.json(inMemoryUsers);
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/users/profile?username=...
async function getProfile(req, res) {
  try {
    const { username } = req.query;
    const targetUsername = username || 'admin_system';

    await ensureTable();

    let user = inMemoryUsers.find(u => u.username === targetUsername);

    try {
      const dbRows = await db.query('SELECT * FROM system_users WHERE username = ? LIMIT 1', [targetUsername]);
      if (dbRows && dbRows.length > 0) {
        const r = dbRows[0];
        user = {
          id: r.id,
          username: r.username,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          employeeId: r.employee_id,
          role: r.role,
          departmentName: r.department_name,
          jobTitle: r.job_title || r.role,
          avatarUrl: r.avatar_url || '',
          status: r.status,
          authMethod: r.auth_method,
          lastLogin: r.last_login
        };
      }
    } catch (e) {}

    if (!user) {
      user = {
        username: targetUsername,
        fullName: 'Admin System',
        email: 'admin@company.com',
        phone: '0901234567',
        role: 'ADMIN',
        departmentName: 'Phòng Công Nghệ Thông Tin (IT Central)',
        jobTitle: 'Quản Trị Viên Hệ Thống',
        avatarUrl: ''
      };
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/profile
async function updateProfile(req, res) {
  try {
    const { username, fullName, email, phone, avatarUrl } = req.body;
    const targetUsername = username || 'admin_system';

    await ensureTable();

    const idx = inMemoryUsers.findIndex(u => u.username === targetUsername);
    if (idx !== -1) {
      inMemoryUsers[idx] = {
        ...inMemoryUsers[idx],
        fullName: fullName !== undefined ? fullName : inMemoryUsers[idx].fullName,
        email: email !== undefined ? email : inMemoryUsers[idx].email,
        phone: phone !== undefined ? phone : inMemoryUsers[idx].phone,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : inMemoryUsers[idx].avatarUrl
      };
    }

    try {
      await db.query(
        `UPDATE system_users 
         SET full_name = COALESCE(?, full_name),
             email = COALESCE(?, email),
             phone = COALESCE(?, phone),
             avatar_url = COALESCE(?, avatar_url)
         WHERE username = ?`,
        [fullName, email, phone, avatarUrl, targetUsername]
      );
    } catch (dbErr) {
      console.warn('DB update profile warning:', dbErr.message);
    }

    const updatedUser = idx !== -1 ? inMemoryUsers[idx] : { username: targetUsername, fullName, email, phone, avatarUrl };
    return res.json({ status: 'success', user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/users
async function createUser(req, res) {
  try {
    const { username, fullName, email, phone, employeeId, role, departmentName, status } = req.body;
    if (!username || !fullName) {
      return res.status(400).json({ error: 'Username và Full Name là bắt buộc.' });
    }

    const newUser = {
      id: Date.now(),
      username,
      fullName,
      email: email || '',
      phone: phone || '',
      employeeId: employeeId || 'EMP',
      role: role || 'STAFF',
      departmentName: departmentName || '',
      status: status || 'ACTIVE',
      authMethod: 'LOCAL',
      lastLogin: 'Chưa đăng nhập'
    };

    try {
      const result = await db.query(
        `INSERT INTO system_users (username, full_name, email, phone, employee_id, role, department_name, status, auth_method, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newUser.username, newUser.fullName, newUser.email, newUser.phone, newUser.employeeId, newUser.role, newUser.departmentName, newUser.status, 'LOCAL', 'Chưa đăng nhập']
      );
      if (result && result.insertId) {
        newUser.id = result.insertId;
      }
    } catch (dbErr) {
      console.warn('DB create user warning:', dbErr.message);
    }

    inMemoryUsers = [newUser, ...inMemoryUsers];
    return res.status(201).json({ status: 'success', user: newUser });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, fullName, email, phone, employeeId, role, departmentName, status } = req.body;

    const userIndex = inMemoryUsers.findIndex(u => String(u.id) === String(id));
    if (userIndex !== -1) {
      inMemoryUsers[userIndex] = {
        ...inMemoryUsers[userIndex],
        username: username || inMemoryUsers[userIndex].username,
        fullName: fullName || inMemoryUsers[userIndex].fullName,
        email: email || inMemoryUsers[userIndex].email,
        phone: phone || inMemoryUsers[userIndex].phone,
        employeeId: employeeId || inMemoryUsers[userIndex].employeeId,
        role: role || inMemoryUsers[userIndex].role,
        departmentName: departmentName || inMemoryUsers[userIndex].departmentName,
        status: status || inMemoryUsers[userIndex].status
      };
    }

    try {
      await db.query(
        `UPDATE system_users 
         SET username = ?, full_name = ?, email = ?, phone = ?, employee_id = ?, role = ?, department_name = ?, status = ?
         WHERE id = ?`,
        [username, fullName, email, phone, employeeId, role, departmentName, status, id]
      );
    } catch (dbErr) {
      console.warn('DB update user warning:', dbErr.message);
    }

    return res.json({ status: 'success', user: inMemoryUsers[userIndex] });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    inMemoryUsers = inMemoryUsers.filter(u => String(u.id) !== String(id));

    try {
      await db.query('DELETE FROM system_users WHERE id = ?', [id]);
    } catch (dbErr) {
      console.warn('DB delete user warning:', dbErr.message);
    }

    return res.json({ status: 'success', message: 'Tài khoản đã được xóa thành công.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// PATCH /api/users/:id/toggle-status
async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const user = inMemoryUsers.find(u => String(u.id) === String(id));
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await db.query('UPDATE system_users SET status = ? WHERE id = ?', [user.status, id]);
    } catch (dbErr) {}

    return res.json({ status: 'success', user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/permissions/matrix
let inMemoryMatrix = { ...defaultPermissionMatrix };

async function getPermissionMatrix(req, res) {
  try {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS permission_matrix (
          role_name VARCHAR(50) PRIMARY KEY,
          permissions_json JSON NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);
      const rows = await db.query('SELECT role_name, permissions_json FROM permission_matrix');
      if (rows.length > 0) {
        const matrix = {};
        rows.forEach(r => {
          try {
            matrix[r.role_name] = typeof r.permissions_json === 'string' ? JSON.parse(r.permissions_json) : r.permissions_json;
          } catch(e) {}
        });
        inMemoryMatrix = { ...defaultPermissionMatrix, ...matrix };
      }
    } catch (dbErr) {
      console.warn('DB permission matrix fetch warning:', dbErr.message);
    }
    return res.json(inMemoryMatrix);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/permissions/matrix
async function savePermissionMatrix(req, res) {
  try {
    const matrix = req.body;
    if (!matrix || typeof matrix !== 'object') {
      return res.status(400).json({ error: 'Invalid matrix data' });
    }

    inMemoryMatrix = { ...inMemoryMatrix, ...matrix };

    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS permission_matrix (
          role_name VARCHAR(50) PRIMARY KEY,
          permissions_json JSON NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);

      for (const [roleName, perms] of Object.entries(matrix)) {
        const jsonStr = JSON.stringify(perms);
        await db.query(
          `INSERT INTO permission_matrix (role_name, permissions_json) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE permissions_json = VALUES(permissions_json)`,
          [roleName, jsonStr]
        );
      }
    } catch (dbErr) {
      console.warn('DB permission matrix save warning:', dbErr.message);
    }

    return res.json({ status: 'success', message: 'Đã lưu ma trận phân quyền thành công.', matrix: inMemoryMatrix });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/users/login
async function loginUser(req, res) {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập.' });
    }

    const cleanUsername = username.trim();

    // 1. Check in Database first
    try {
      await ensureTable();
      const rows = await db.query('SELECT * FROM system_users WHERE username = ?', [cleanUsername]);
      if (rows.length > 0) {
        const u = rows[0];
        if (u.status === 'INACTIVE') {
          return res.status(403).json({ error: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin.' });
        }
        return res.json({
          status: 'success',
          user: {
            id: u.id,
            username: u.username,
            fullName: u.full_name,
            email: u.email,
            phone: u.phone,
            employeeId: u.employee_id,
            role: u.role || 'STAFF',
            departmentName: u.department_name,
            jobTitle: u.job_title || 'Cán Bộ Nhân Viên',
            status: u.status,
            avatarUrl: u.avatar_url || ''
          }
        });
      }
    } catch (dbErr) {
      console.warn('DB login query warning:', dbErr.message);
    }

    // 2. Check in memory list fallback
    const foundUser = inMemoryUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (foundUser) {
      if (foundUser.status === 'INACTIVE') {
        return res.status(403).json({ error: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin.' });
      }
      return res.json({
        status: 'success',
        user: foundUser
      });
    }

    // 3. Fallback for new staff account
    return res.json({
      status: 'success',
      user: {
        username: cleanUsername,
        fullName: cleanUsername,
        role: 'STAFF',
        jobTitle: 'Cán Bộ Nhân Viên',
        departmentName: 'Phòng Ban Trực Thuộc',
        email: `${cleanUsername}@company.com`
      }
    });
  } catch (err) {
    console.error('loginUser error:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  getProfile,
  updateProfile,
  createUser,
  updateUser,
  deleteUser,
  toggleStatus,
  getPermissionMatrix,
  savePermissionMatrix,
  loginUser
};
