import React from 'react';
import { useParams } from 'react-router-dom';
import './BlogPost.css';

const BlogPost = () => {
    const { id } = useParams();

    // This is a placeholder. Later we'll fetch the actual blog post data from Firebase
    const blogPost = {
        title: "The Art of Storytelling",
        date: "March 15, 2024",
        content: `
            When crafting a story, every detail matters. From the initial hook that draws readers in, to the careful development of characters and plot, storytelling is an intricate art form that requires both creativity and technical skill.

            The most compelling stories often come from a place of authenticity, drawing on personal experiences while weaving in universal themes that readers can connect with. This balance between the personal and the universal is what makes storytelling such a powerful medium for communication.
        `,
        imageUrl: "https://placekitten.com/800/400"
    };

    return (
        <article className="blog-post">
            <header className="blog-header">
                <h1>{blogPost.title}</h1>
                <p className="blog-date">{blogPost.date}</p>
            </header>
            <div className="blog-post-image">
                <img src={blogPost.imageUrl} alt={blogPost.title} />
            </div>
            <div className="blog-post-content">
                {blogPost.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph.trim()}</p>
                ))}
            </div>
        </article>
    );
};

export default BlogPost;