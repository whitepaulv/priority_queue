"""
AI Assistant service.
Handles interactions with Google Gemini API for task management assistance.
"""

import os
import google.generativeai as genai
from typing import Optional, List
from models.task import Task

class AIService:
    """
    Service for AI assistant functionality using Google Gemini.
    Provides motivational messages, task reminders, and general assistance.
    """
    
    def __init__(self):
        """Initialize the AI service with Gemini API key."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        # Use gemini-2.0-flash (fastest and most available)
        # Fallback to gemini-flash-latest if needed
        try:
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        except Exception:
            try:
                self.model = genai.GenerativeModel('gemini-flash-latest')
            except Exception:
                # Last resort
                self.model = genai.GenerativeModel('gemini-pro-latest')
        self.conversation_history: List[dict] = []
    
    def chat(self, user_message: str, tasks: Optional[List[Task]] = None) -> str:
        """
        Generate a response to a user message.
        
        Args:
            user_message: The user's message
            tasks: Optional list of current tasks for context
            
        Returns:
            AI assistant's response
        """
        try:
            # Build context about tasks if available
            context = self._build_task_context(tasks)
            
            # Create system prompt for the assistant
            system_prompt = """You are a helpful AI assistant for a task management app called PriorityForge. 
Tone: Lighthearted, happy, encouraging.
Length: Short and to the point.
Format: No emojis. Use exclamation points after each sentence (unless the sentence is a question).
Style: Encouraging.
Random-ness: High. Let there be a LOT of variation in the wording the AI uses.
Content: 100% focused on the task. Nothing else should be mentioned.
When relevant, you can reference their tasks to provide helpful suggestions.
Keep responses brief and conversational."""
            
            # Build the full prompt
            prompt = f"{system_prompt}\n\n{context}\n\nUser: {user_message}\n\nAssistant:"
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Extract text from response - handle different response formats
            if response:
                # Method 1: Direct text attribute (most common)
                if hasattr(response, 'text') and response.text:
                    return response.text.strip()
                
                # Method 2: Via candidates
                if hasattr(response, 'candidates') and response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content'):
                        if hasattr(candidate.content, 'parts') and candidate.content.parts:
                            text = candidate.content.parts[0].text
                            if text:
                                return text.strip()
                        elif hasattr(candidate.content, 'text'):
                            return candidate.content.text.strip()
                
                # Method 3: Try to get result
                if hasattr(response, 'result'):
                    result = response.result
                    if isinstance(result, str):
                        return result.strip()
                    elif hasattr(result, 'text'):
                        return result.text.strip()
                
                # Method 4: Try string conversion
                response_str = str(response)
                if response_str and len(response_str) > 10:  # Avoid generic object strings
                    return response_str.strip()
            
            return "I'm having trouble processing that. Could you try rephrasing?"
                
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error in AI service: {e}")
            print(f"Full traceback:\n{error_details}")
            # Return a more helpful error message
            error_msg = str(e)
            if "API_KEY" in error_msg or "authentication" in error_msg.lower():
                return "Please check that your GEMINI_API_KEY is set correctly in the .env file."
            elif "model" in error_msg.lower() or "not found" in error_msg.lower():
                return "The AI model is not available. Please check the model name."
            else:
                return f"I encountered an error: {error_msg[:100]}"
    
    def get_motivational_message(self, task_title: Optional[str] = None) -> str:
        """
        Generate a motivational message, optionally for a specific task.
        
        Args:
            task_title: Optional task title for personalized motivation
            
        Returns:
            Motivational message
        """
        try:
            if task_title:
                prompt = f"""Generate a short, encouraging message for someone who just created a task called '{task_title}'. 
Tone: Lighthearted, happy, encouraging.
Length: Short and to the point (1-2 sentences max).
Format: No emojis. Use exclamation points after each sentence (unless the sentence is a question).
Style: Encouraging.
Content: 100% focused on the task '{task_title}'. Nothing else should be mentioned.
Example: "Good luck on completing {task_title}! I'm sure you'll do great!" """
            else:
                prompt = """Generate a short, encouraging message for someone who just created a task. 
Tone: Lighthearted, happy, encouraging.
Length: Short and to the point (1-2 sentences max).
Format: No emojis. Use exclamation points after each sentence (unless the sentence is a question).
Style: Encouraging.
Content: 100% focused on the task. Nothing else should be mentioned."""
            
            response = self.model.generate_content(prompt)
            return response.text.strip() if response and response.text else f"Good luck on completing {task_title if task_title else 'your task'}! I'm sure you'll do great!"
            
        except Exception as e:
            print(f"Error generating motivational message: {e}")
            return f"Good luck on completing {task_title if task_title else 'your task'}! I'm sure you'll do great!"
    
    def _build_task_context(self, tasks: Optional[List[Task]]) -> str:
        """Build context string about user's tasks."""
        if not tasks:
            return "The user doesn't have any tasks yet."
        
        active_tasks = [t for t in tasks if not t.completed]
        completed_tasks = [t for t in tasks if t.completed]
        
        context = f"User has {len(active_tasks)} active task(s) and {len(completed_tasks)} completed task(s)."
        
        if active_tasks:
            context += "\n\nActive tasks:"
            for task in active_tasks[:5]:  # Limit to 5 tasks for context
                due_info = ""
                if task.due_date:
                    # Calculate days until due
                    from datetime import datetime
                    try:
                        due_date = datetime.fromisoformat(str(task.due_date).replace('Z', '+00:00')) if isinstance(task.due_date, str) else task.due_date
                        now = datetime.now(due_date.tzinfo) if hasattr(due_date, 'tzinfo') and due_date.tzinfo else datetime.now()
                        days_diff = (due_date - now).days
                        if days_diff > 0:
                            due_info = f" (due in {days_diff} day{'s' if days_diff != 1 else ''})"
                        elif days_diff == 0:
                            due_info = " (due today)"
                        else:
                            due_info = f" ({abs(days_diff)} day{'s' if abs(days_diff) != 1 else ''} overdue)"
                    except:
                        due_info = " (due soon)"
                context += f"\n- {task.title} (urgency: {task.urgency}/5, difficulty: {task.difficulty}/5){due_info}"
        
        return context

