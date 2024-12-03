import { createSignal, Show, For } from 'solid-js';
import { createEvent } from './supabaseClient';
import SolidMarkdown from 'solid-markdown';

function App() {
  const [story, setStory] = createSignal('');
  const [images, setImages] = createSignal([]);
  const [loadingStory, setLoadingStory] = createSignal(false);
  const [loadingImages, setLoadingImages] = createSignal(false);
  const [prompt, setPrompt] = createSignal('');
  const [error, setError] = createSignal('');

  const generateStory = async () => {
    if (!prompt()) {
      setError('الرجاء إدخال فكرة للقصة');
      return;
    }
    setError('');
    setLoadingStory(true);
    setStory('');
    setImages([]);
    try {
      const result = await createEvent('chatgpt_request', {
        app_id: import.meta.env.VITE_PUBLIC_APP_ID,
        prompt: `توليد قصة كرتونية للأطفال حول: ${prompt()} . الرجاء تقديم القصة في تنسيق JSON مع البنية التالية: { "story": "نص القصة" }`,
        response_type: 'json',
      });
      setStory(result.story);
      await generateImages(result.story);
    } catch (err) {
      console.error('Error generating story:', err);
      setError('حدث خطأ أثناء توليد القصة');
    } finally {
      setLoadingStory(false);
    }
  };

  const generateImages = async (storyText) => {
    setLoadingImages(true);
    try {
      const storyParts = storyText.split(/[.\n]/).filter((part) => part.trim() !== '');
      const imagesArray = [];
      for (const part of storyParts) {
        const imageResult = await createEvent('generate_image', {
          app_id: import.meta.env.VITE_PUBLIC_APP_ID,
          prompt: `رسم كرتوني للمشهد التالي: ${part}`,
        });
        imagesArray.push(imageResult);
      }
      setImages(imagesArray);
    } catch (err) {
      console.error('Error generating images:', err);
      setError('حدث خطأ أثناء توليد الصور');
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <div class="h-full bg-gradient-to-br from-blue-100 to-purple-100 p-4 text-gray-800">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-center text-purple-700 mb-6">توليد قصة كرتونية</h1>
        <div class="mb-4 text-center">
          <input
            type="text"
            placeholder="أدخل فكرة القصة هنا"
            value={prompt()}
            onInput={(e) => setPrompt(e.target.value)}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border text-gray-800"
          />
        </div>
        <div class="flex justify-center space-x-4 mb-6">
          <button
            onClick={generateStory}
            disabled={loadingStory()}
            class={`px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 ${
              loadingStory() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {loadingStory() ? '...جاري التوليد' : 'توليد القصة'}
          </button>
        </div>
        <Show when={error()}>
          <div class="text-red-500 text-center mb-4">{error()}</div>
        </Show>
        <Show when={story()}>
          <div class="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 class="text-2xl font-bold text-purple-700 mb-4">القصة</h2>
            <SolidMarkdown>{story()}</SolidMarkdown>
          </div>
        </Show>
        <Show when={loadingImages()}>
          <div class="text-center text-purple-700 mb-4">...جاري توليد الصور</div>
        </Show>
        <Show when={images().length}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <For each={images()}>
              {(image) => (
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <img src={image} alt="صورة من القصة" class="w-full h-auto rounded-md" />
                </div>
              )}
            </For>
          </div>
        </Show>
        <div class="mt-8 text-center">
          <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-500">
            Made on ZAPT
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;