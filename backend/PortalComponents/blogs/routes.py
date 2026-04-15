"""Blogs routes - Store and retrieve blog posts in blog_posts table."""
import os
import logging
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
blogs_bp = Blueprint('blogs', __name__, url_prefix='/api/admin/blogs')


def get_db_connection():
    """Create and return a MySQL database connection."""
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")

    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name
        )
        return conn
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise


@blogs_bp.route('', methods=['GET'])
def get_blogs():
    """
    Get all blog posts.
    
    Returns:
        JSON response with list of blog posts
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, title, content, image_path, created_at
            FROM blog_posts
            ORDER BY created_at DESC
        """)
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings
        for result in results:
            if result.get('created_at'):
                result['created_at'] = str(result['created_at'])
        
        return jsonify({
            "success": True,
            "blogs": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching blogs: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching blogs"
        }), 500


@blogs_bp.route('/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    """
    Get a specific blog post by ID.
    
    Args:
        blog_id: The blog ID
    
    Returns:
        JSON response with blog details
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, title, content, image_path, created_at
            FROM blog_posts
            WHERE id = %s
        """, (blog_id,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            return jsonify({
                "success": False,
                "message": "Blog not found"
            }), 404
        
        # Convert datetime objects to strings
        if result.get('created_at'):
            result['created_at'] = str(result['created_at'])
        
        return jsonify({
            "success": True,
            "blog": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching blog: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching blog details"
        }), 500


@blogs_bp.route('', methods=['POST'])
def create_blog():
    """
    Create a new blog post.
    
    Expected JSON payload:
    {
        "title": "Blog Title",
        "content": "Full blog content (HTML allowed)"
    }
    
    Returns:
        JSON response with success status and message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract and validate input
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        
        # Validation
        errors = []
        if not title:
            errors.append("Title is required")
        if not content:
            errors.append("Content is required")
        
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Use default image path (file uploads can be added later)
        image_path = '../assets/img/Blogs/default.jpg'
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert into blog_posts table
        insert_sql = """INSERT INTO blog_posts 
            (title, content, image_path, created_at) 
            VALUES (%s, %s, %s, NOW())"""
        
        insert_values = (title, content, image_path)
        
        try:
            cursor.execute(insert_sql, insert_values)
            conn.commit()
            
            blog_id = cursor.lastrowid
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Blog post created successfully",
                "blog_id": blog_id
            }), 201
            
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Database error occurred while creating blog"
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating blog: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@blogs_bp.route('/<int:blog_id>', methods=['PUT'])
def update_blog(blog_id):
    """
    Update an existing blog post.
    
    Args:
        blog_id: The blog ID
    
    Expected JSON payload:
    {
        "title": "Blog Title",
        "author": "Author Name",
        "shortDescription": "Short description",
        "content": "Full blog content",
        "imagePath": "/path/to/image.jpg"
    }
    
    Returns:
        JSON response with success status and message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract input
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        image_path = data.get('imagePath', '../assets/img/Blogs/default.jpg')
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update blog_posts table
        update_sql = """UPDATE blog_posts 
            SET title = %s, content = %s, image_path = %s
            WHERE id = %s"""
        
        update_values = (title, content, image_path, blog_id)
        
        try:
            cursor.execute(update_sql, update_values)
            conn.commit()
            
            if cursor.rowcount == 0:
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "Blog not found"
                }), 404
            
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Blog post updated successfully"
            }), 200
            
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Database error occurred while updating blog"
            }), 500
            
    except Exception as e:
        logger.error(f"Error updating blog: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@blogs_bp.route('/<int:blog_id>', methods=['DELETE'])
def delete_blog(blog_id):
    """
    Delete a blog post.
    
    Args:
        blog_id: The blog ID
    
    Returns:
        JSON response with success status and message
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM blog_posts WHERE id = %s", (blog_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Blog not found"
            }), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Blog post deleted successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting blog: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error deleting blog"
        }), 500

