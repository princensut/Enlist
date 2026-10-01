def test_unauthenticated_admin_access(client):
    response = client.get("/api/admin/applications")
    assert response.status_code == 401

def test_student_forbidden_admin_access(client, db_session):
    from app.models.user import User, UserRole
    from app.core.security import create_access_token
    
    student = User(name="Stud", email="stud@test.com", password_hash="hash", role=UserRole.STUDENT)
    db_session.add(student)
    db_session.commit()
    
    token = create_access_token({"sub": student.id, "role": student.role.value})
    client.cookies.set("access_token", token)
    
    response = client.get("/api/admin/applications")
    assert response.status_code == 403

def test_admin_allowed_access(client, db_session):
    from app.models.user import User, UserRole
    from app.core.security import create_access_token
    
    admin = User(name="Admin", email="admin@test.com", password_hash="hash", role=UserRole.ADMIN)
    db_session.add(admin)
    db_session.commit()
    
    token = create_access_token({"sub": admin.id, "role": admin.role.value})
    client.cookies.set("access_token", token)
    
    response = client.get("/api/admin/applications")
    assert response.status_code == 200