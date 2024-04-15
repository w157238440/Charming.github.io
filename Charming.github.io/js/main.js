<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炫酷个人主页</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        body {
            font-family: '微软雅黑', sans-serif;
            background-color: #222;
            color: #fff;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
        }
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
        }
        header {
            margin-bottom: 50px;
        }
        .profile-pic {
            border-radius: 50%;
            width: 200px;
            height: 200px;
            object-fit: cover;
            border: 5px solid #fff;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            animation: glow 2s ease-in-out infinite alternate;
        }
        p {
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .social-links a {
            color: #fff;
            font-size: 2em;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        .social-links a:hover {
            transform: scale(1.2);
        }
        .intro {
            margin-bottom: 50px;
            padding: 0 20%;
        }
        .projects {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .project-item {
            margin: 20px;
        }
        .project-item img {
            width: 250px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            transition: transform 0.3s ease;
        }
        .project-item img:hover {
            transform: scale(1.1);
        }
        footer {
            text-align: center;
            padding: 20px 0;
        }

        @keyframes glow {
            0% {
                text-shadow: 0 0 10px #fff;
            }
            100% {
                text-shadow: 0 0 20px #ff00de, 0 0 30px #00bcd4, 0 0 40px #6eff00, 0 0 50px #fffb00, 0 0 60px #ff00de, 0 0 70px #00bcd4, 0 0 80px #6eff00, 0 0 90px #fffb00;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <img class="profile-pic" src="profile-pic.jpg" alt="个人头像">
        <h1>小明</h1>
        <p>Web开发者 | 摄影师 | 音乐人</p>
        <div class="social-links">
            <a href="https://twitter.com" target="_blank"><i class="fab fa-twitter"></i></a>
            <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
            <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank"><i class="fab fa-linkedin"></i></a>
            <a href="https://github.com" target="_blank"><i class="fab fa-github"></i></a>
        </div>
    </header>

    <div class="intro">
        <h2>个人简介</h2>
        <p>大家好，我是小明，一个热爱编程、摄影和音乐的多才多艺的人。我喜欢挑战自己，探索新的技术和创意。我擅长使用各种前端和后端技术构建优秀的网站和应用程序，同时我也是一名业余摄影师和音乐制作人。欢迎来到我的个人主页，希望你能喜欢我的作品！</p>
    </div>

    <div class="projects">
        <h2>项目展示</h2>
        <div class="project-item">
            <img src="project1.jpg" alt="项目1">
            <p>项目1介绍</p>
        </div>
        <div class="project-item">
            <img src="project2.jpg" alt="项目2">
            <p>项目2介绍</p>
        </div>
        <div class="project-item">
            <img src="project3.jpg" alt="项目3">
            <p>项目3介绍</p>
        </div>
    </div>
</div>

<footer>
    <p>&copy; 2024 小明. 版权所有。</p>
</footer>

</body>
</html>
