import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id):
    try:
        # Get list of all available transcripts
        # Check if cookies.txt exists in the current directory or a specific location
        cookies_file = "cookies.txt"
        import os
        if not os.path.exists(cookies_file):
            cookies_file = "/app/cookies.txt" # Docker default path check
        
        if os.path.exists(cookies_file):
            transcript_list_obj = YouTubeTranscriptApi.list_transcripts(video_id, cookies=cookies_file)
        else:
            transcript_list_obj = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Convert to list for manual iteration
        transcripts = list(transcript_list_obj)
        
        selected_transcript = None
        
        # Priority 1: English (any variant like 'en', 'en-US')
        for t in transcripts:
            if t.language_code.startswith('en'):
                selected_transcript = t
                break
        
        # Priority 2: Any Manually Created Transcript (if English not found)
        if not selected_transcript:
            for t in transcripts:
                if not t.is_generated:
                    selected_transcript = t
                    break
        
        # Priority 3: Fallback to the first available transcript (e.g., auto-generated Hindi)
        if not selected_transcript and transcripts:
            selected_transcript = transcripts[0]
            
        if selected_transcript:
            # Fetch the actual content
            fetched_data = selected_transcript.fetch()
            
            # Combine text
            # The fetch() method returns an iterable of FetchedTranscriptSnippet objects
            # which we must access via attributes, not dictionary syntax.
            full_text = " ".join([item.text for item in fetched_data])
            return json.dumps({"status": "success", "transcript": full_text})
        else:
            return json.dumps({"status": "error", "message": "No transcripts found for this video."})

    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No video ID provided"}))
        sys.exit(1)
    
    video_id = sys.argv[1]
    print(get_transcript(video_id))
