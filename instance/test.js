<!-- Session Content -->
<div class="bg-white rounded-xl shadow-lg p-8 prose max-w-none">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Content for "{{ session.title }}"</h2>
    {% if session.session_type == 'learning_session' %}
        {% if session.materials %}
            <div class="space-y-6">
                {% for material in session.materials %}
                    <div class="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm">
                        <h3 class="text-xl font-semibold text-indigo-700 mb-2">{{ material.name }}</h3>
                        <div class="text-gray-800 leading-relaxed prose max-w-none">
                            {# --- START CONTENT TYPE HANDLING --- #}
                            {% if material.type == 'video' %}
                                {# Video embedding logic (your existing code) #}
                                {% set youtube_watch_prefix = 'youtube.com/watch?v=' %}
                                {% set youtu_be_prefix = 'youtu.be/' %}
                                {% set video_id = none %}

                                {% if youtube_watch_prefix in material.content %}
                                    {% set video_id_start = material.content.find('v=') + 2 %}
                                    {% set video_id_end = material.content.find('&', video_id_start) %}
                                    {% if video_id_end == -1 %}
                                        {% set video_id = material.content[video_id_start:] %}
                                    {% else %}
                                        {% set video_id = material.content[video_id_start:video_id_end] %}
                                    {% endif %}
                                {% elif youtu_be_prefix in material.content %}
                                    {% set video_id_start = material.content.find(youtu_be_prefix) + youtu_be_prefix|length %}
                                    {% set video_id_end = material.content.find('?', video_id_start) %}
                                    {% if video_id_end == -1 %}
                                        {% set video_id = material.content[video_id_start:] %}
                                    {% else %}
                                        {% set video_id = material.content[video_id_start:video_id_end] %}
                                    {% endif %}
                                {% endif %}

                                {% if video_id %}
                                    <div class="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg shadow-md mb-4">
                                        <iframe
                                            class="w-full"
                                            height="400"
                                            src="https://www.youtube-nocookie.com/embed/{{ video_id }}"
                                            frameborder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowfullscreen
                                            title="{{ material.name }}"
                                            referrerpolicy="strict-origin-when-cross-origin"
                                        ></iframe>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-2">Source: <a href="{{ material.content }}" target="_blank" class="text-blue-500 hover:underline">{{ material.name }}</a></p>   
                                {% else %}
                                    <p class="text-gray-800 leading-relaxed prose max-w-none">
                                        <span class="font-medium">Video Link:</span> <a href="{{ material.content }}" target="_blank" class="text-blue-500 hover:underline">{{ material.name }}</a>
                                    </p>
                                {% endif %}
                            
                            {% elif material.type == 'image' %}
                                {# --- IMAGE DISPLAY LOGIC --- #}
                                <div class="flex flex-col items-center">
                                    <div class="max-w-full mb-4 rounded-lg overflow-hidden shadow-md">
                                        <img 
                                            src="{{ material.content }}" 
                                            alt="{{ material.name }}"
                                            class="max-w-full h-auto object-contain max-h-96"
                                            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                                        >
                                        <div class="hidden bg-red-50 p-4 rounded border border-red-200 text-red-800">
                                            <p class="font-medium">Image failed to load</p>
                                            <p class="text-sm">URL: <a href="{{ material.content }}" target="_blank" class="text-blue-500 hover:underline break-all">{{ material.content|truncate(50) }}</a></p>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-500 text-center">
                                        Source: <a href="{{ material.content }}" target="_blank" class="text-blue-500 hover:underline break-all">{{ material.content|truncate(50) }}</a>
                                    </p>
                                </div>
                            
                            {% else %}
                                {# Default content display for text and other types #}
                                {{ material.content | safe }}
                            {% endif %}
                            {# --- END CONTENT TYPE HANDLING --- #}
                        </div>
                    </div>
                {% endfor %}
            </div>
        {% else %}
            <p class="text-gray-500 italic">No learning materials found for this session.</p>
        {% endif %}
    {% elif session.session_type == 'quiz_session' %}
        <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200 shadow-inner">
            <h3 class="text-xl font-bold text-yellow-800 mb-4">Quiz Session: {{ session.title }}</h3>
            <p class="text-gray-700 mb-4">
                This is a placeholder for the quiz interface. As a teacher, you're viewing how students would encounter this.
            </p>
            <p class="text-gray-600 italic">
                (Quiz questions and options would be dynamically loaded here for a student.)
            </p>
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out mt-4">
                Start Quiz (Teacher Preview)
            </button>
        </div>
    {% endif %}
</div>