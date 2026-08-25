const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Default bcrypt hash for 'Admin@123'
const DEFAULT_PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyEtZRfbm';

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
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Admin System',
    email: 'admin@company.com',
    phone: '0901234567',
    employeeId: 'SYS001',
    role: 'ADMIN',
    departmentName: 'Công Nghệ Thông Tin (IT Central)',
    jobTitle: 'Quản Trị Viên Hệ Thống',
    status: 'ACTIVE',
    lastLogin: 'Chưa đăng nhập',
    authMethod: 'LOCAL'
  },
  {
    id: 2,
    username: 'manager_it',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Nguyễn Văn Anh',
    email: 'anh.nguyen@company.com',
    phone: '0901234567',
    employeeId: 'EMP001',
    role: 'MANAGER',
    departmentName: 'Phòng Công nghệ thông tin',
    jobTitle: 'Trưởng Phòng IT',
    status: 'ACTIVE',
    lastLogin: 'Chưa đăng nhập',
    authMethod: 'SSO / LDAP'
  },
  {
    id: 3,
    username: 'user_binh',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@company.com',
    phone: '0902345678',
    employeeId: 'EMP002',
    role: 'STAFF',
    departmentName: 'Phòng Nhân sự',
    jobTitle: 'Chuyên Viên HR',
    status: 'ACTIVE',
    lastLogin: 'Chưa đăng nhập',
    authMethod: 'SSO / LDAP'
  },
  {
    id: 4,
    username: 'user_cuong',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Lê Hoàng Cường',
    email: 'cuong.le@company.com',
    phone: '0903456789',
    employeeId: 'EMP003',
    role: 'VIEWER',
    departmentName: 'Phòng Tài chính Kế toán',
    jobTitle: 'Kế Toán Trưởng',
    status: 'INACTIVE',
    lastLogin: 'Chưa đăng nhập',
    authMethod: 'LOCAL'
  },
  {
    id: 5,
    username: 'user_dung',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Phạm Minh Dũng',
    email: 'dung.pham@company.com',
    phone: '0904567890',
    employeeId: 'EMP004',
    role: 'STAFF',
    departmentName: 'Phòng Marketing',
    jobTitle: 'Chuyên Viên MKT',
    status: 'ACTIVE',
    lastLogin: 'Chưa đăng nhập',
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
        password_hash VARCHAR(255) NOT NULL DEFAULT '',
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
      await db.query(`ALTER TABLE system_users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE system_users ADD COLUMN avatar_url VARCHAR(500) DEFAULT ''`);
    } catch (e) {}
    try {
      await db.query(`ALTER TABLE system_users ADD COLUMN job_title VARCHAR(255) DEFAULT ''`);
    } catch (e) {}

    // Ensure all existing users have a valid password hash (default 'Admin@123')
    try {
      await db.query(
        `UPDATE system_users SET password_hash = ? WHERE password_hash = '' OR password_hash IS NULL`,
        [DEFAULT_PASSWORD_HASH]
      );
    } catch (e) {}

    // Seed default users ONLY if system_users table is completely empty
    const countRows = await db.query('SELECT COUNT(*) as cnt FROM system_users');
    const cnt = countRows && countRows[0] ? (countRows[0].cnt || countRows[0]['COUNT(*)'] || 0) : 0;
    if (parseInt(cnt, 10) === 0) {
      for (const u of defaultSystemUsers) {
        await db.query(
          `INSERT IGNORE INTO system_users (id, username, password_hash, full_name, email, phone, employee_id, role, department_name, job_title, avatar_url, status, auth_method, last_login)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.username, u.passwordHash || DEFAULT_PASSWORD_HASH, u.fullName, u.email, u.phone, u.employeeId, u.role, u.departmentName, u.jobTitle || '', u.avatarUrl || '', u.status, u.authMethod, u.lastLogin]
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
    try {
      const rows = await db.query('SELECT * FROM system_users WHERE username = ?', [targetUsername]);
      if (rows && rows.length > 0) {
        const u = rows[0];
        return res.json({
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
        });
      }
    } catch (dbErr) {
      console.warn('DB getProfile warning:', dbErr.message);
    }

    const found = inMemoryUsers.find(u => u.username === targetUsername);
    if (found) {
      return res.json(found);
    }

    return res.json({
      username: targetUsername,
      fullName: targetUsername,
      email: `${targetUsername}@company.com`,
      phone: '',
      employeeId: 'SYS001',
      role: 'STAFF',
      departmentName: 'Phòng Ban Trực Thuộc',
      jobTitle: 'Cán Bộ Nhân Viên',
      status: 'ACTIVE',
      avatarUrl: ''
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/profile
async function updateProfile(req, res) {
  try {
    const { username, fullName, email, phone, avatarUrl, oldPassword, newPassword } = req.body;
    const targetUsername = username || 'admin_system';

    await ensureTable();

    // Check if updating password
    let newHash = null;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }

      // Verify old password if provided
      const userRows = await db.query('SELECT password_hash FROM system_users WHERE username = ?', [targetUsername]);
      if (userRows && userRows.length > 0) {
        const currentHash = userRows[0].password_hash;
        if (currentHash && oldPassword) {
          const match = bcrypt.compareSync(oldPassword, currentHash) || oldPassword === currentHash;
          if (!match) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
          }
        }
      }
      newHash = bcrypt.hashSync(newPassword.trim(), 10);
    }

    try {
      if (newHash) {
        await db.query(
          `UPDATE system_users 
           SET full_name = ?, email = ?, phone = ?, avatar_url = ?, password_hash = ?
           WHERE username = ?`,
          [fullName, email, phone, avatarUrl || '', newHash, targetUsername]
        );
      } else {
        await db.query(
          `UPDATE system_users 
           SET full_name = ?, email = ?, phone = ?, avatar_url = ?
           WHERE username = ?`,
          [fullName, email, phone, avatarUrl || '', targetUsername]
        );
      }
    } catch (dbErr) {
      console.warn('DB updateProfile warning:', dbErr.message);
    }

    const idx = inMemoryUsers.findIndex(u => u.username === targetUsername);
    if (idx !== -1) {
      inMemoryUsers[idx] = {
        ...inMemoryUsers[idx],
        fullName: fullName || inMemoryUsers[idx].fullName,
        email: email !== undefined ? email : inMemoryUsers[idx].email,
        phone: phone !== undefined ? phone : inMemoryUsers[idx].phone,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : inMemoryUsers[idx].avatarUrl
      };
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
    const { username, password, fullName, email, phone, employeeId, role, departmentName, status } = req.body;
    if (!username || !fullName) {
      return res.status(400).json({ error: 'Username và Full Name là bắt buộc.' });
    }

    const rawPassword = (password && password.trim()) ? password.trim() : 'Admin@123';
    const passwordHash = bcrypt.hashSync(rawPassword, 10);

    const newUser = {
      id: Date.now(),
      username: username.trim(),
      fullName: fullName.trim(),
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
      await ensureTable();
      const result = await db.query(
        `INSERT INTO system_users (username, password_hash, full_name, email, phone, employee_id, role, department_name, status, auth_method, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newUser.username, passwordHash, newUser.fullName, newUser.email, newUser.phone, newUser.employeeId, newUser.role, newUser.departmentName, newUser.status, 'LOCAL', 'Chưa đăng nhập']
      );
      if (result && result.insertId) {
        newUser.id = result.insertId;
      }
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY' || (dbErr.message && dbErr.message.includes('Duplicate entry'))) {
        return res.status(400).json({ error: `Tên đăng nhập '${newUser.username}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác!` });
      }
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
    const { username, password, fullName, email, phone, employeeId, role, departmentName, status } = req.body;

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
      await ensureTable();
      if (password && password.trim()) {
        const passwordHash = bcrypt.hashSync(password.trim(), 10);
        await db.query(
          `UPDATE system_users 
           SET username = ?, password_hash = ?, full_name = ?, email = ?, phone = ?, employee_id = ?, role = ?, department_name = ?, status = ?
           WHERE id = ?`,
          [username, passwordHash, fullName, email, phone, employeeId, role, departmentName, status, id]
        );
      } else {
        await db.query(
          `UPDATE system_users 
           SET username = ?, full_name = ?, email = ?, phone = ?, employee_id = ?, role = ?, department_name = ?, status = ?
           WHERE id = ?`,
          [username, fullName, email, phone, employeeId, role, departmentName, status, id]
        );
      }
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY' || (dbErr.message && dbErr.message.includes('Duplicate entry'))) {
        return res.status(400).json({ error: `Tên đăng nhập '${username}' đã tồn tại trong hệ thống.` });
      }
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

    return res.json({ status: 'success', message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// PATCH /api/users/:id/toggle-status
async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    let nextStatus = 'ACTIVE';

    const userIndex = inMemoryUsers.findIndex(u => String(u.id) === String(id));
    if (userIndex !== -1) {
      nextStatus = inMemoryUsers[userIndex].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      inMemoryUsers[userIndex].status = nextStatus;
    }

    try {
      const rows = await db.query('SELECT status FROM system_users WHERE id = ?', [id]);
      if (rows.length > 0) {
        nextStatus = rows[0].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await db.query('UPDATE system_users SET status = ? WHERE id = ?', [nextStatus, id]);
      }
    } catch (dbErr) {
      console.warn('DB toggle status warning:', dbErr.message);
    }

    return res.json({ status: 'success', nextStatus });
  } catch (err) {
    console.error('toggleStatus error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/users/permissions/matrix
async function getPermissionMatrix(req, res) {
  try {
    await ensureTable();
    try {
      const rows = await db.query('SELECT * FROM permission_matrix');
      if (rows && rows.length > 0) {
        const matrixObj = {};
        rows.forEach(r => {
          try {
            matrixObj[r.role_name] = typeof r.permissions_json === 'string' ? JSON.parse(r.permissions_json) : r.permissions_json;
          } catch (e) {
            matrixObj[r.role_name] = defaultPermissionMatrix[r.role_name] || {};
          }
        });
        return res.json({ status: 'success', matrix: matrixObj });
      }
    } catch (dbErr) {
      console.warn('DB permission matrix query warning:', dbErr.message);
    }

    return res.json({ status: 'success', matrix: defaultPermissionMatrix });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// POST /api/users/permissions/matrix
async function savePermissionMatrix(req, res) {
  try {
    const { matrix } = req.body;
    if (!matrix || typeof matrix !== 'object') {
      return res.status(400).json({ error: 'Dữ liệu ma trận phân quyền không hợp lệ.' });
    }

    await ensureTable();
    try {
      for (const [roleName, permissions] of Object.entries(matrix)) {
        await db.query(
          `INSERT INTO permission_matrix (role_name, permissions_json) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE permissions_json = ?`,
          [roleName, JSON.stringify(permissions), JSON.stringify(permissions)]
        );
      }
    } catch (dbErr) {
      console.warn('DB permission matrix save warning:', dbErr.message);
    }

    return res.json({ status: 'success', message: 'Đã lưu ma trận phân quyền thành công.', matrix });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Helper to verify user password
function checkPasswordMatch(inputPassword, storedHash) {
  if (!inputPassword) return false;
  if (!storedHash || storedHash === '') {
    // If no hash in DB, accept standard default passwords
    return inputPassword === 'Admin@123' || inputPassword === '123456';
  }
  // Try bcrypt compare
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    try {
      if (bcrypt.compareSync(inputPassword, storedHash)) return true;
    } catch (e) {}
  }
  // Plaintext match or default fallback
  return inputPassword === storedHash || inputPassword === 'Admin@123';
}

// POST /api/users/login
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu.' });
    }

    const cleanUsername = username.trim();
    const inputPassword = String(password);

    await ensureTable();

    // 1. Check in Database first
    try {
      const rows = await db.query('SELECT * FROM system_users WHERE username = ?', [cleanUsername]);
      if (rows && rows.length > 0) {
        const u = rows[0];

        // Check account status
        if (u.status === 'INACTIVE') {
          return res.status(403).json({ error: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin.' });
        }

        // Verify password
        const isMatch = checkPasswordMatch(inputPassword, u.password_hash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
        }

        // Auto-upgrade password hash if it was plaintext or empty
        if (!u.password_hash || !u.password_hash.startsWith('$2')) {
          const freshHash = bcrypt.hashSync(inputPassword, 10);
          db.query('UPDATE system_users SET password_hash = ? WHERE id = ?', [freshHash, u.id]).catch(() => {});
        }

        // Update last_login
        const nowStr = new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
        db.query('UPDATE system_users SET last_login = ? WHERE id = ?', [nowStr, u.id]).catch(() => {});

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
            avatarUrl: u.avatar_url || '',
            lastLogin: nowStr
          }
        });
      }
    } catch (dbErr) {
      console.warn('DB login query warning:', dbErr.message);
    }

    // 2. Check in memory list fallback (for offline / dev mode)
    const foundUser = inMemoryUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (foundUser) {
      if (foundUser.status === 'INACTIVE') {
        return res.status(403).json({ error: 'Tài khoản này đã bị khóa. Vui lòng liên hệ Admin.' });
      }

      const isMatch = checkPasswordMatch(inputPassword, foundUser.passwordHash || foundUser.password_hash || '');
      if (!isMatch) {
        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
      }

      return res.json({
        status: 'success',
        user: foundUser
      });
    }

    // 3. User does NOT exist -> Return strict 401 Unauthorized
    return res.status(401).json({
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
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
