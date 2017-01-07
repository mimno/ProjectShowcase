__author__ = 'william'
import re
import sys
import collections
import json


class ChessGame:
    game_header = collections.namedtuple('GameHeader', ['event', 'site', 'white_elo', 'black_elo', 'white_is_comp',
                                              'black_is_comp', 'time_control', 'date', 'eco', 'num_moves', 'result'])
    header = game_header
    # event = ""
    # site = ""
    # white_ELO = 0
    # black_ELO = 0
    # white_is_comp = True
    # black_is_comp = True
    # time_control = ""
    # date = ""
    # eco = ""
    # num_moves = 0
    # result = 0
    moves_line = ""
    all_moves = []
    first_moves = []

    def __init__(self, header, moves_line):

        self.header = header
        self.set_moves_fields_from_moves_line(moves_line)

    def print_first_moves(self):
        print self.first_moves

    def set_moves_fields_from_moves_line(self, moves_line):
        self.moves_line = moves_line
        moves_line = moves_line[0:moves_line.rfind("{")].strip()
        regex = re.compile('\d+\.')
        self.all_moves = [move for move in moves_line.split(" ") if not regex.match(move)]
        self.first_moves = self.all_moves[:NUM_OPENING_MOVES]

    @staticmethod
    def get_header_info(header_lines):
        event = ""
        site = ""
        white_elo = -1
        black_elo = -1
        white_is_comp = False
        black_is_comp = False
        time_control = ""
        date = ""
        eco = ""
        num_moves = -1
        result = ""
        for line in header_lines:
            if line.startswith("[Event"):
                # Set event
                event = line.split('"')[1]
            elif line.startswith("[Site"):
                # Set site
                site = line.split('"')[1]
            elif line.startswith("[WhiteElo"):
                white_elo = int(float(line.split('"')[1]))
            elif line.startswith("[BlackElo"):
                black_elo = int(float(line.split('"')[1]))
            elif line.startswith("[WhiteIsComp") and line.find("Yes") != -1:
                white_is_comp = True
            elif line.startswith("[BlackIsComp") and line.find("Yes") != -1:
                black_is_comp = True
            elif line.startswith("[TimeControl"):
                time_control = line.split('"')[1]
            elif line.startswith("[Date"):
                date = line.split('"')[1]
            elif line.startswith("[Time"):
                time = line.split('"')[1]
            elif line.startswith("[ECO"):
                eco = line.split('"')[1]
            elif line.startswith("[PlyCount"):
                num_moves = int(float(line.split('"')[1]))
            elif line.startswith("[Result"):
                result = line.split('"')[1]
        header = ChessGame.game_header(event, site, white_elo, black_elo, white_is_comp, black_is_comp, time_control,
                                       date, eco, num_moves, result)
        return header

    @staticmethod
    def get_games_from_files(fnames, max_num_games=9999999):
        print "max num games", max_num_games
        games = []
        for fname in fnames:
            print fname
        with open(fname, "r") as f:
            lines = f.readlines()
            num_lines = len(lines)
            i = 0
            num_games = 0

            while i < num_lines and num_games < max_num_games:
                line = lines[i].strip()
                # header = game_header("", "", -1, -1, False, False, "", "", "", -1, "")
                if line.startswith("[Event"):
                    header_start_line = i
                elif line.startswith("1."):
                    header = ChessGame.get_header_info(lines[header_start_line:i])
                    if header.num_moves > MIN_MOVES_PER_GAME:
                        game = ChessGame(header, lines[i])
                        num_games += 1
                        if num_games % 1000 == 0:
                            print num_games
                        games.append(game)
                i += 1
        print "Total of", num_games, "games processed"
        return games

    def get_header(self):
        return self.header

    def get_first_moves(self):
        return self.first_moves

    def get_all_moves(self):
        return self.all_moves

    def get_moves_line(self):
        return self.moves_line


# Games (G)
NUM_GAMES_TO_PARSE = 2000
# Levels (L)
NUM_OPENING_MOVES = 10
# Minimum number of moves in a game
MIN_MOVES_PER_GAME = 0
# Maximum branching factor
MAX_BRANCHING_FACTOR = 8
# Minimum branching factor
MIN_BRANCHING_FACTOR = 4
# Change in branching factor from layer to layer
DELTA_BRANCHING_FACTOR = 1


def main():
    #ficsgamesdb_2013_blitz2000_nomovetimes_1234428
    #mini
    games = ChessGame.get_games_from_files(['ficsgamesdb_2013_blitz2000_nomovetimes_1234428.pgn'], NUM_GAMES_TO_PARSE)

    tree = create_sunburst_tree(games)

    output_file = "chess_" + str(NUM_GAMES_TO_PARSE) + "G_" + str(NUM_OPENING_MOVES) + "L"
    # with open(output_file + ".json", 'w') as fp:
    #     json.dump(tree, fp)
    # print "Output to", output_file
    set_branching_factor(tree, MAX_BRANCHING_FACTOR)
    set_num_children_attr(tree)
    prune_tree(tree)
    set_num_children_attr(tree)
    set_win_data(tree)
    output_file_pruned = output_file + "_" + str(MAX_BRANCHING_FACTOR) + "_" +str(MIN_BRANCHING_FACTOR) + "_" + str(
        DELTA_BRANCHING_FACTOR) + "B"
    with open(output_file_pruned + ".json", 'w') as fp:
        json.dump(tree, fp)
    print json.dumps(tree, indent=2)
    print "Pruned tree output to", output_file_pruned



# Find a dictionary in a list by a key/value
def find(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return i
    return -1


# Add a node to the tree structure
def add_node(node, moves, header):
    # Last layer
    if len(moves) == 1:
        if "size" not in node.keys():
            node["size"] = 1
        else:
            node["size"] += 1

        # The reason we only add it to the last layer is because we are pruning
        if "whiteWins" not in node.keys():
            node["whiteWins"] = 0
        if "blackWins" not in node.keys():
            node["blackWins"] = 0
        if "ties" not in node.keys():
            node["ties"] = 0

        if header.result == "1-0":
            node["whiteWins"] += 1
        elif header.result == "0-1":
            node["blackWins"] += 1
        elif header.result == "1/2-1/2":
            node["ties"] += 1

    else:
        move = moves[0]
        if "children" not in node.keys():
            node["children"] = []
        ind = find(node["children"], "name", move)
        if ind == -1:
            node["children"].append({"name": move})
        add_node(node["children"][ind], moves[1:], header)


# Create the sunburst tree
def create_sunburst_tree(games):
    tree = {"name": "start"}
    for game in games:
        moves = game.get_first_moves()
        header = game.get_header()
        add_node(tree, moves, header)

    set_moves(tree, [])
    set_depth(tree, 0)
    return tree


def set_num_children_attr(node):
    if "size" in node.keys():
        num_children = node["size"]
    else:
        num_children = 0
    if "children" in node.keys():
        for child in node["children"]:
            num_children += set_num_children_attr(child)
    node["numGames"] = num_children
    return num_children


def set_branching_factor(node, bf):
    node["bf"] = bf
    if "children" in node.keys():
        for child in node["children"]:
            set_branching_factor(child, max(bf-DELTA_BRANCHING_FACTOR, MIN_BRANCHING_FACTOR))


# Prune the tree to have a smaller branching factor
# def prune_tree(node, branching_factor):
#     if "children" in node.keys():
#         node["children"] = remove_extra_children(node["children"], branching_factor)
#         for child in node["children"]:
#             prune_tree(child, branching_factor)

def set_moves(node, prior_moves):
    if node["name"] != "start":
        node["moves"] = prior_moves[:]
        node["moves"].append(node["name"])
    else:
        node["moves"] = []

    if "children" in node.keys():
        for child in node["children"]:
            set_moves(child, node["moves"])


def set_depth(node, depth):
    node["depth"] = depth
    if "children" in node.keys():
        for child in node["children"]:
            set_depth(child, depth+1)


def prune_tree(node):
    if "children" in node.keys():
        node["children"] = remove_extra_children(node["children"], node["bf"])
        for child in node["children"]:
            prune_tree(child)


def set_win_data(node):
    if "children" in node.keys():
        white_wins = 0
        black_wins = 0
        ties = 0
        for child in node["children"]:
            set_win_data(child)
            white_wins += child["whiteWins"]
            black_wins += child["blackWins"]
            ties += child["ties"]

        node["whiteWins"] = white_wins
        node["blackWins"] = black_wins
        node["ties"] = ties


def remove_extra_children(lst, branching_factor):
    sorted_list = sorted(lst, key=lambda k: k['numGames'], reverse=True)
    return sorted_list[:branching_factor]


if __name__ == "__main__": main()


