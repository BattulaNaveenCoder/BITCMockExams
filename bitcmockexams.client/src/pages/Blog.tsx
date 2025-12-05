import { useState } from 'react';
import { FaClock, FaUser } from 'react-icons/fa';
import Card from '@shared/components/ui/Card';
import { blogPosts } from '../data/mockData';

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Certification Tips', 'Cloud Computing', 'DevOps', 'Security', 'Career', 'Architecture'];

    const filteredPosts = selectedCategory === 'All'
        ? blogPosts
        : blogPosts.filter(post => post.category === selectedCategory);

    const featuredPost = blogPosts[0];

    return (
        <div className="blog-page">
            {/* Page Header */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4 text-white">Blog & Insights</h1>
                    <p className="text-xl text-white/90 max-w-[600px] mx-auto">
                        Expert tips, industry insights, and certification guidance
                    </p>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    {/* Featured Post */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-lg overflow-hidden shadow-xl mb-16">
                        <div className="relative h-[400px] md:h-[250px]">
                            <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
                            <span className="absolute top-6 left-6 bg-primary-blue text-white px-4 py-2 rounded-md font-semibold text-sm">Featured</span>
                        </div>
                        <div className="p-12 flex flex-col justify-center md:p-6">
                            <span className="inline-block px-3 py-1 bg-light-blue text-primary-blue text-xs font-semibold uppercase rounded mb-4 w-fit">{featuredPost.category}</span>
                            <h2 className="text-3xl font-bold mb-4 md:text-2xl">{featuredPost.title}</h2>
                            <p className="text-lg text-text-secondary mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                            <div className="flex gap-6 flex-wrap mb-6">
                                <span className="flex items-center gap-2 text-text-light text-sm">
                                    <FaUser /> {featuredPost.author}
                                </span>
                                <span className="flex items-center gap-2 text-text-light text-sm">
                                    <FaClock /> {featuredPost.readTime}
                                </span>
                                <span className="flex items-center gap-2 text-text-light text-sm">{featuredPost.date}</span>
                            </div>
                            <a href="#" className="text-primary-blue font-semibold text-lg no-underline transition-colors duration-150 hover:text-secondary-blue">Read Article →</a>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-4 mb-12 flex-wrap justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`px-6 py-2 border-2 border-border rounded-md font-semibold cursor-pointer transition-all duration-150 hover:border-primary-blue hover:text-primary-blue ${selectedCategory === cat ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white text-text-secondary'}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Blog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
                        {filteredPosts.map((post) => (
                            <Card
                                key={post.id}
                                image={post.image}
                                imageAlt={post.title}
                                badge={post.category}
                                hover
                            >
                                <h3 className="text-lg font-bold mb-2 leading-snug">{post.title}</h3>
                                <p className="text-sm text-text-secondary mb-4 leading-relaxed">{post.excerpt}</p>
                                <div className="flex flex-col gap-2 mb-2">
                                    <span className="flex items-center gap-2 text-text-light text-sm">
                                        <FaUser /> {post.author}
                                    </span>
                                    <span className="flex items-center gap-2 text-text-light text-sm">
                                        <FaClock /> {post.readTime}
                                    </span>
                                </div>
                                <div className="text-sm text-text-light mb-4">{post.date}</div>
                                <a href="#" className="text-primary-blue font-semibold no-underline mt-auto hover:text-secondary-blue">Read More →</a>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Blog;
