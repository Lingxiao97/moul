#!/usr/bin/env python3
"""
A vocabulary learning application for背单词 (memorizing words)
"""

import json
import random
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional


class Word:
    """Represents a vocabulary word with its translation, example, and learning status"""

    def __init__(self, word: str, translation: str, example: str = "",
                 learned: bool = False, times_seen: int = 0,
                 times_correct: int = 0, next_review_date: str = None):
        self.word = word
        self.translation = translation
        self.example = example
        self.learned = learned
        self.times_seen = times_seen
        self.times_correct = times_correct
        self.next_review_date = next_review_date or str(datetime.now().date())

    def to_dict(self) -> Dict:
        return {
            "word": self.word,
            "translation": self.translation,
            "example": self.example,
            "learned": self.learned,
            "times_seen": self.times_seen,
            "times_correct": self.times_correct,
            "next_review_date": self.next_review_date
        }

    @classmethod
    def from_dict(cls, data: Dict):
        return cls(
            data["word"],
            data["translation"],
            data.get("example", ""),
            data.get("learned", False),
            data.get("times_seen", 0),
            data.get("times_correct", 0),
            data.get("next_review_date", str(datetime.now().date()))
        )


class VocabularyApp:
    """Main vocabulary learning application"""

    def __init__(self, data_file: str = "vocabulary.json"):
        self.data_file = data_file
        self.words: List[Word] = []
        self.load_data()

    def load_data(self):
        """Load vocabulary data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.words = [Word.from_dict(word_data) for word_data in data]
            except Exception as e:
                print(f"Error loading data: {e}")
                self.words = []
        else:
            # Create an initial sample vocabulary for testing
            self.words = [
                Word("hello", "你好", "Hello, how are you? 你好，你好吗？"),
                Word("world", "世界", "Hello world! 你好世界！"),
                Word("computer", "计算机", "I use a computer every day. 我每天都用计算机。"),
                Word("book", "书", "I like reading books. 我喜欢读书。"),
                Word("water", "水", "I drink water every day. 我每天都喝水。"),
                Word("food", "食物", "I need to buy some food. 我需要买一些食物。"),
                Word("home", "家", "I want to go home. 我想回家。"),
                Word("friend", "朋友", "She is my friend. 她是我的朋友。"),
                Word("work", "工作", "I have to go to work. 我得去工作。"),
                Word("car", "汽车", "He has a new car. 他有一辆新车。")
            ]
            self.save_data()

    def save_data(self):
        """Save vocabulary data to file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump([word.to_dict() for word in self.words], f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")

    def add_word(self, word: str, translation: str, example: str = ""):
        """Add a new word to the vocabulary"""
        # Check if word already exists (case insensitive)
        existing_word = None
        for w in self.words:
            if w.word.lower() == word.lower():
                print(f"Word '{word}' already exists in vocabulary.")
                return False

        new_word = Word(word, translation, example)
        self.words.append(new_word)
        self.save_data()
        print(f"Added word '{word}' to vocabulary.")
        return True

    def study_mode(self):
        """Study mode - review words you need to learn"""
        today = datetime.now().date()
        due_words = [w for w in self.words if w.next_review_date <= str(today)]

        if not due_words:
            print("No words to review today! Great job!")
            return

        print(f"\n=== Study Mode ===")
        print(f"There are {len(due_words)} words to review today.")

        # Shuffle the words for better learning
        random.shuffle(due_words)

        for i, word in enumerate(due_words, 1):
            word.times_seen += 1
            print(f"\n--- Word {i}/{len(due_words)} ---")
            print(f"Word: {word.word}")
            input("Press Enter to see translation and example...")

            # Show more detailed information
            print(f"Translation: {word.translation}")
            if word.example:
                print(f"Example: {word.example}")

            if word.times_seen > 1:
                print(f"Seen {word.times_seen} times, Correct {word.times_correct} times.")

            # Ask user if they knew the word
            while True:
                response = input("\nDid you know this word? (y/n): ").lower().strip()
                if response in ['y', 'yes', '是']:
                    word.times_correct += 1
                    # Implement spaced repetition - if correct, increase interval
                    new_interval = self.calculate_next_review_days(word)
                    word.next_review_date = str(today + timedelta(days=new_interval))
                    word.learned = True if word.times_correct >= 5 else word.learned  # Mark as learned after 5 correct replies
                    print(f"Great! Next review in {new_interval} days.")
                    break
                elif response in ['n', 'no', '否']:
                    # Mark for sooner review if wrong
                    word.next_review_date = str(today + timedelta(days=1))
                    word.learned = False
                    print("Word marked for review tomorrow.")
                    break
                else:
                    print("Please enter 'y' for yes or 'n' for no.")

        self.save_data()
        print(f"\nStudy session completed! {len(due_words)} words reviewed.")

    def calculate_next_review_days(self, word: Word) -> int:
        """Calculate how many days until next review based on spaced repetition algorithm"""
        correct_ratio = word.times_correct / word.times_seen if word.times_seen > 0 else 0

        if correct_ratio < 0.5:
            return 1  # Review again tomorrow if often wrong
        elif correct_ratio < 0.75:
            return 2  # Review in 2 days if sometimes wrong
        elif correct_ratio < 0.9:
            return 4  # Review in 4 days if doing OK
        elif word.times_correct <= 2:
            return 10  # After some successful recalls, longer interval
        elif word.times_correct <= 5:
            return 20  # After several recalls, even longer
        else:
            return 30  # For well-learned words

    def quiz_mode(self):
        """Quiz mode - test your knowledge"""
        if len(self.words) < 4:
            print("Need at least 4 words to take the quiz.")
            return

        print(f"\n=== Quiz Mode ===")
        print("Choose the correct translation for each word!")

        # Select random words for quiz (max 10)
        quiz_words = random.sample(self.words, min(10, len(self.words)))
        score = 0

        for i, word in enumerate(quiz_words, 1):
            print(f"\n--- Question {i}/{len(quiz_words)} ---")
            print(f"Word: {word.word}")

            # Get 3 random translations from other words + the correct one
            all_translations = [w.translation for w in self.words if w != word]
            options = [word.translation] + random.sample(all_translations, min(3, len(all_translations)))
            random.shuffle(options)

            print("Options:")
            for idx, option in enumerate(options, 1):
                print(f"{idx}. {option}")

            # Get user's answer
            try:
                user_choice = int(input("Enter your choice (1-4): "))
                if 1 <= user_choice <= len(options):
                    selected_translation = options[user_choice-1]
                    if selected_translation == word.translation:
                        print("✓ Correct!")
                        score += 1
                        word.times_correct += 1
                    else:
                        print(f"✗ Wrong! Correct answer was: {word.translation}")
                    word.times_seen += 1  # Mark as seen during quiz too
                else:
                    print("Invalid choice, marked as incorrect and skipped question.")
            except ValueError:
                print("Invalid input, marked as incorrect and skipped question.")

        print(f"\nQuiz completed! Score: {score}/{len(quiz_words)} ({100*score/len(quiz_words):.1f}%)")

        # Save updates from quiz
        self.save_data()

    def word_list(self):
        """Display all words in the vocabulary"""
        if not self.words:
            print("\n=== Vocabulary List ===")
            print("Your vocabulary is empty. Add some words first!")
            return

        print(f"\n=== Vocabulary List ===")
        print(f"Total words: {len(self.words)}")

        # Sort by next review date and learned status
        sorted_words = sorted(self.words, key=lambda w: (w.learned, w.next_review_date))

        today = datetime.now().date()

        for i, word in enumerate(sorted_words, 1):
            status = "✓" if word.learned else "○"
            days_until_review = (datetime.strptime(word.next_review_date, '%Y-%m-%d').date() - today).days
            if days_until_review < 0:
                review_status = "Due"
            elif days_until_review == 0:
                review_status = "Today"
            else:
                review_status = f"In {days_until_review} days"

            print(f"{i:2d}. {status} {word.word} -> {word.translation} [{review_status}]")
            if word.example:
                print(f"      Example: {word.example}")

    def show_statistics(self):
        """Show learning statistics"""
        total_words = len(self.words)
        if total_words == 0:
            print("\n=== Statistics ===")
            print("No words in vocabulary yet.")
            return

        learned_words = sum(1 for w in self.words if w.learned)
        today = datetime.now().date()
        due_words = sum(1 for w in self.words if w.next_review_date <= str(today))

        total_seen = sum(w.times_seen for w in self.words)
        total_correct = sum(w.times_correct for w in self.words)
        accuracy = (total_correct / total_seen * 100) if total_seen > 0 else 0

        # Calculate word familiarity percentage
        if total_seen > 0:
            average_correctness = sum(w.times_correct / w.times_seen if w.times_seen > 0 else 0 for w in self.words) / total_words * 100
        else:
            average_correctness = 0

        print(f"\n=== Statistics ===")
        print(f"Total Words: {total_words}")
        print(f"Words Learned: {learned_words}")
        print(f"Progress: {learned_words}/{total_words} ({learned_words*100//total_words if total_words > 0 else 0}%)")
        print(f"Current due for Review: {due_words}")
        print(f"Total Seen in Study/Quiz: {total_seen}")
        print(f"Overall Accuracy: {accuracy:.1f}%")
        print(f"Average Word Knowledge: {average_correctness:.1f}%")

    def show_progress(self):
        """Additional progress view with upcoming reviews"""
        print(f"\n=== Progress Overview ===")
        if not self.words:
            print("No words in vocabulary yet.")
            return

        today = datetime.now().date()

        # Group and count by review date
        review_schedule = {}
        for word in self.words:
            review_date = word.next_review_date
            if review_date not in review_schedule:
                review_schedule[review_date] = 0
            review_schedule[review_date] += 1

        # Sort by date (earliest first)
        sorted_reviews = sorted(review_schedule.items())

        print("Upcoming Review Schedule:")
        for date_str, count in sorted_reviews:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            days_diff = (date - today).days

            if days_diff == 0:
                when = "Today"
            elif days_diff < 0:
                when = f"{abs(days_diff)} days ago"
            else:
                when = f"In {days_diff} days"

            print(f"   {date_str} ({when}): {count} word{'s' if count != 1 else ''}")

        print("")


def main():
    app = VocabularyApp()

    print("=== 背单词 - Vocabulary Learning App ===")

    while True:
        print("\nMenu:")
        print("1. Study Mode (Review words)")
        print("2. Quiz Mode (Test yourself)")
        print("3. Add a new word")
        print("4. View vocabulary list")
        print("5. View statistics")
        print("6. Progress overview")
        print("7. Add words from file")
        print("8. Exit")

        choice = input("Choose an option (1-8): ").strip()

        if choice == "1":
            app.study_mode()
        elif choice == "2":
            app.quiz_mode()
        elif choice == "3":
            word = input("Enter word: ").strip()
            if word:
                translation = input("Enter translation: ").strip()
                if translation:
                    example = input("Enter example (optional): ").strip()
                    app.add_word(word, translation, example)
                else:
                    print("Translation is required!")
            else:
                print("Word cannot be empty!")
        elif choice == "4":
            app.word_list()
        elif choice == "5":
            app.show_statistics()
        elif choice == "6":
            app.show_progress()
        elif choice == "7":
            filename = input("Enter filename (vocabulary_sample.txt): ").strip()
            if not filename:
                filename = "vocabulary_sample.txt"
            app.add_from_file(filename)
        elif choice == "8":
            print("Thanks for using 背单词! Keep learning!")
            break
        else:
            print("Invalid choice. Please enter 1-8.")


if __name__ == "__main__":
    main()