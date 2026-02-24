---
layout: page
title: 博主日记
---

<div class="diary-container">
  <p class="diary-intro">记录日常点滴、心情随笔和生活感悟。</p>
  
  <div class="diary-list">
    {% assign diary_posts = site.posts | where_exp: "post", "post.categories contains '日记'" %}
    {% if diary_posts.size > 0 %}
      {% for post in diary_posts %}
        <article class="diary-item">
          <div class="diary-date">
            <span class="diary-day">{{ post.date | date: "%d" }}</span>
            <span class="diary-month">{{ post.date | date: "%m月" }}</span>
            <span class="diary-year">{{ post.date | date: "%Y" }}</span>
          </div>
          <div class="diary-content">
            <h3 class="diary-title">
              <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            </h3>
            {% if post.excerpt %}
              <p class="diary-excerpt">{{ post.excerpt | strip_html | truncate: 100 }}</p>
            {% endif %}
            <div class="diary-meta">
              <span class="diary-mood">{% if post.mood %}心情: {{ post.mood }}{% endif %}</span>
              <span class="diary-weather">{% if post.weather %}天气: {{ post.weather }}{% endif %}</span>
            </div>
          </div>
        </article>
      {% endfor %}
    {% else %}
      <div class="empty-state">
        <p>还没有日记，开始记录第一篇吧...</p>
      </div>
    {% endif %}
  </div>
</div>

<style>
.diary-container {
  max-width: 800px;
  margin: 0 auto;
}

.diary-intro {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.diary-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.diary-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.diary-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  border-radius: 12px;
  color: white;
}

.diary-day {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.diary-month {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.diary-year {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.diary-content {
  flex: 1;
}

.diary-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.diary-title a {
  color: var(--text-primary);
}

.diary-title a:hover {
  color: var(--primary-color);
}

.diary-excerpt {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.diary-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .diary-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .diary-date {
    flex-direction: row;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    min-width: auto;
  }
  
  .diary-day {
    font-size: 1.25rem;
  }
}
</style>
