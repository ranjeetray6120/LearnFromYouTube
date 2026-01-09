import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

# Try importing deep_translator
HAS_TRANSLATOR = False
try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    pass

def get_transcript(video_id, target_lang='en'):
    try:
        # Get list of all available transcripts
        transcript_list_obj = YouTubeTranscriptApi().list(video_id)
        
        transcript = None
        
        # 1. Try to find direct match (manually created)
        try:
            transcript = transcript_list_obj.find_manually_created_transcript([target_lang])
        except:
            pass
            
        # 2. Try to find generated match
        if not transcript:
            try:
                transcript = transcript_list_obj.find_generated_transcript([target_lang])
            except:
                pass
                
        # 3. If not found, try to translate from the first available transcript (YouTube Native)
        if not transcript:
            try:
                for t in transcript_list_obj:
                    if t.is_translatable:
                        transcript = t.translate(target_lang)
                        break
            except Exception as e:
                pass

        # 4. FALLBACK: If still no transcript, just use the first available one
        if not transcript:
            try:
                 for t in transcript_list_obj:
                     transcript = t
                     break
            except:
                pass

        if not transcript:
             return json.dumps({"status": "error", "message": f"No transcript found for language {target_lang}."})

        # Fetch the actual transcript data
        transcript_data = transcript.fetch()
        
        # Helper to safely extract text
        def get_text(entry):
            if isinstance(entry, dict):
                return entry.get('text', '')
            elif hasattr(entry, 'text'):
                return entry.text
            return str(entry)

        full_text = " ".join([get_text(entry) for entry in transcript_data])

        # 5. DEEP TRANSLATOR FALLBACK
        current_lang = getattr(transcript, 'language_code', 'unknown')
        
        # Check condition 1
        if HAS_TRANSLATOR and target_lang != 'en' and current_lang != target_lang and not current_lang.startswith(target_lang):
             try:
                 chunk_size = 2000
                 chunks = [full_text[i:i+chunk_size] for i in range(0, len(full_text), chunk_size)]
                 
                 translator = GoogleTranslator(source='auto', target=target_lang)
                 translated_chunks = []
                 for chunk in chunks:
                     translated_chunks.append(translator.translate(chunk))
                     # valid delay to be polite
                     import time
                     time.sleep(0.5)
                     
                 full_text = " ".join(translated_chunks)
             except Exception as e:
                 pass
        
        # Special Case: User wants English
        elif HAS_TRANSLATOR and target_lang == 'en' and not current_lang.startswith('en'):
             try:
                 chunk_size = 2000
                 chunks = [full_text[i:i+chunk_size] for i in range(0, len(full_text), chunk_size)]
                 translator = GoogleTranslator(source='auto', target='en')
                 translated_chunks = []
                 for chunk in chunks:
                     res = translator.translate(chunk)
                     translated_chunks.append(res)
                     import time
                     time.sleep(0.5)
                     
                 full_text = " ".join(translated_chunks)
             except Exception as e:
                 pass

        return json.dumps({"status": "success", "transcript": full_text})
        
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "Video ID is required"}))
    else:
        video_id = sys.argv[1]
        target_lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
        print(get_transcript(video_id, target_lang))
