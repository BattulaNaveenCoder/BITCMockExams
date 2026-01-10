import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    tweeterTitle?: string;
    TweeterDes?: string;
    ogImage?: string;
    ogimgalt?: string;
    structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({ 
    title, 
    description, 
    keywords, 
    canonical, 
    ogTitle, 
    ogDescription, 
    tweeterTitle, 
    TweeterDes, 
    ogImage, 
    ogimgalt, 
    structuredData 
}) => {
    const default_Title = "BITC Mock Exams | Microsoft Certification Practice Tests & IT Exam Preparation";
    const default_Description = "Prepare for Microsoft certifications with BITC Mock Exams. Practice tests for Azure, AI, ML, .NET, and more. Get exam-ready with our comprehensive mock exams and detailed explanations.";
    const default_Keywords = "Microsoft certification, Azure certification, mock exams, practice tests, IT certification, AZ-900, AZ-104, AZ-204, AZ-305, AZ-400, AI-900, AI-102, Microsoft exams, certification preparation, online practice tests, Microsoft Azure, cloud computing certification, .NET certification, exam preparation";
    const default_Canonical = "https://www.bitcmockexams.com/";
    const default_OgImg = "/og-image.jpg";

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title || default_Title}</title>
            <meta name="title" content={title || default_Title} />
            <meta name="description" content={description || default_Description} />
            <meta name="keywords" content={keywords || default_Keywords} />
            <link rel="canonical" href={canonical || default_Canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:url" content={canonical || default_Canonical} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitle || title || default_Title} />
            <meta property="og:description" content={ogDescription || description || default_Description} />
            <meta property="og:image" content={ogImage || default_OgImg} />
            {ogimgalt && <meta property="og:image:alt" content={ogimgalt} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={tweeterTitle || title || default_Title} />
            <meta name="twitter:description" content={TweeterDes || description || default_Description} />
            <meta name="twitter:image" content={ogImage || default_OgImg} />
            {ogimgalt && <meta name="twitter:image:alt" content={ogimgalt} />}

            {/* Structured Data (Schema.org) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    )
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    canonical: PropTypes.string,
    ogTitle: PropTypes.string,
    ogDescription: PropTypes.string,
    tweeterTitle: PropTypes.string,
    TweeterDes: PropTypes.string,
    ogImage: PropTypes.string,
    ogimgalt: PropTypes.string,
    structuredData: PropTypes.object,
};

export default SEO
