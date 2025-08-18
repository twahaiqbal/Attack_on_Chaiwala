import pygame
import random
import sys

# Initialize Pygame
pygame.init()

# Screen settings
CELL_SIZE = 40
GRID_WIDTH = 20
GRID_HEIGHT = 20
SCREEN_WIDTH = CELL_SIZE * GRID_WIDTH
SCREEN_HEIGHT = CELL_SIZE * GRID_HEIGHT
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Attack on Chaiwala")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)


# Load images
apa_img = pygame.transform.scale(pygame.image.load("apa.jpg"), (CELL_SIZE, CELL_SIZE))
chaiwala_img = pygame.transform.scale(pygame.image.load("chaiwala.jpg"), (CELL_SIZE, CELL_SIZE))
trash_img = pygame.transform.scale(pygame.image.load("trash.jpg"), (CELL_SIZE, CELL_SIZE))
# Load shojon texture for background
shojon_img = pygame.transform.scale(pygame.image.load("shojon.jpg"), (SCREEN_WIDTH, SCREEN_HEIGHT))

# Clock
clock = pygame.time.Clock()



# Game variables

def reset_game():
    global apa_pos, trashes, direction, chaiwala_pos, score, game_over, paused, speed
    apa_pos = [GRID_WIDTH // 2, GRID_HEIGHT // 2]
    trashes = []
    direction = (0, 0)
    chaiwala_pos = [random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1)]
    score = 0
    game_over = False
    paused = False
    speed = 10  # initial speed (frames per second)

reset_game()

font = pygame.font.SysFont(None, 36)

# Function to draw grid
def draw_grid():
    for x in range(0, SCREEN_WIDTH, CELL_SIZE):
        pygame.draw.line(screen, (200, 200, 200), (x, 0), (x, SCREEN_HEIGHT))
    for y in range(0, SCREEN_HEIGHT, CELL_SIZE):
        pygame.draw.line(screen, (200, 200, 200), (0, y), (SCREEN_WIDTH, y))

# Function to draw scoreboard
def draw_score():
    # Draw shadow
    text_shadow = font.render(f"Score: {score}", True, (0,0,0))
    screen.blit(text_shadow, (13, 13))
    # Draw main text (yellow)
    text = font.render(f"Score: {score}", True, (255, 255, 0))
    screen.blit(text, (10, 10))

# Main game loop
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == pygame.KEYDOWN:
            # Arrow keys and WASD controls
            if not paused and not game_over:
                if (event.key == pygame.K_UP or event.key == pygame.K_w) and direction != (0, 1):
                    direction = (0, -1)
                elif (event.key == pygame.K_DOWN or event.key == pygame.K_s) and direction != (0, -1):
                    direction = (0, 1)
                elif (event.key == pygame.K_LEFT or event.key == pygame.K_a) and direction != (1, 0):
                    direction = (-1, 0)
                elif (event.key == pygame.K_RIGHT or event.key == pygame.K_d) and direction != (-1, 0):
                    direction = (1, 0)
            # Pause/unpause with E
            if event.key == pygame.K_e:
                if not game_over:
                    paused = not paused
            # Restart with R
            if event.key == pygame.K_r:
                reset_game()

    if not paused and not game_over and direction != (0, 0):
        prev_head = list(apa_pos)
        # Move Apa
        apa_pos[0] += direction[0]
        apa_pos[1] += direction[1]
        # Wrap around screen edges
        apa_pos[0] = apa_pos[0] % GRID_WIDTH
        apa_pos[1] = apa_pos[1] % GRID_HEIGHT

        # Insert previous head at the start of the tail
        if trashes:
            trashes = [prev_head] + trashes

        # Check collisions with chaiwala
        if apa_pos == chaiwala_pos:
            # Grow: keep the new tail segment
            chaiwala_pos = [random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1)]
            score += 1
            # Increase speed moderately after each bunch of chaiwala
            import math
            bump = int(math.log2(score + 1)) if score > 0 else 0
            speed = 10 + bump * 2  # base 10, +2 fps for each power of 2 chaiwala
        else:
            # Move: remove the last tail segment if not eating
            if trashes:
                trashes.pop()

        # If first chaiwala eaten, start tail
        if not trashes and score > 0:
            trashes = [prev_head]

        # Check self collision (trashes)
        if apa_pos in trashes:
            game_over = True

    # Drawing

    screen.blit(shojon_img, (0, 0))
    draw_grid()
    if not game_over:
        screen.blit(apa_img, (apa_pos[0] * CELL_SIZE, apa_pos[1] * CELL_SIZE))
        for trash in trashes:
            screen.blit(trash_img, (trash[0] * CELL_SIZE, trash[1] * CELL_SIZE))
        # If chaiwala overlaps with Apa or any trash, draw a black spot
        if chaiwala_pos == apa_pos or chaiwala_pos in trashes:
            center_x = chaiwala_pos[0] * CELL_SIZE + CELL_SIZE // 2
            center_y = chaiwala_pos[1] * CELL_SIZE + CELL_SIZE // 2
            pygame.draw.circle(screen, BLACK, (center_x, center_y), CELL_SIZE // 3)
        else:
            screen.blit(chaiwala_img, (chaiwala_pos[0] * CELL_SIZE, chaiwala_pos[1] * CELL_SIZE))
        draw_score()
        if paused:
            pause_font = pygame.font.SysFont(None, 72)
            # Shadow
            pause_text_shadow = pause_font.render("Paused", True, (0,0,0))
            screen.blit(pause_text_shadow, (SCREEN_WIDTH//2 - pause_text_shadow.get_width()//2 + 3, SCREEN_HEIGHT//2 - 37))
            # Main text (cyan)
            pause_text = pause_font.render("Paused", True, (0, 255, 255))
            screen.blit(pause_text, (SCREEN_WIDTH//2 - pause_text.get_width()//2, SCREEN_HEIGHT//2 - 40))
    else:
        # Game over screen
        game_over_font = pygame.font.SysFont(None, 72)
        score_font = pygame.font.SysFont(None, 48)

        # Game Over shadow
        go_text_shadow = game_over_font.render("Game Over!", True, (0,0,0))
        # Game Over main (red)
        go_text = game_over_font.render("Game Over!", True, (255, 60, 60))
        # Score shadow
        score_text_shadow = score_font.render(f"Score: {score}", True, (0,0,0))
        # Score main (yellow)
        score_text = score_font.render(f"Score: {score}", True, (255, 255, 0))
        # Restart shadow
        restart_text_shadow = score_font.render("Press R to Restart", True, (0,0,0))
        # Restart main (lime)
        restart_text = score_font.render("Press R to Restart", True, (0, 255, 0))

        screen.blit(go_text_shadow, (SCREEN_WIDTH//2 - go_text_shadow.get_width()//2 + 3, SCREEN_HEIGHT//2 - 77))
        screen.blit(go_text, (SCREEN_WIDTH//2 - go_text.get_width()//2, SCREEN_HEIGHT//2 - 80))
        screen.blit(score_text_shadow, (SCREEN_WIDTH//2 - score_text_shadow.get_width()//2 + 2, SCREEN_HEIGHT//2 + 3))
        screen.blit(score_text, (SCREEN_WIDTH//2 - score_text.get_width()//2, SCREEN_HEIGHT//2))
        screen.blit(restart_text_shadow, (SCREEN_WIDTH//2 - restart_text_shadow.get_width()//2 + 2, SCREEN_HEIGHT//2 + 63))
        screen.blit(restart_text, (SCREEN_WIDTH//2 - restart_text.get_width()//2, SCREEN_HEIGHT//2 + 60))

    pygame.display.flip()
    clock.tick(speed)
