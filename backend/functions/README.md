# Functions Folder

This folder contains the backend functions for the project. These functions are implemented using Python and are designed to work with Firebase.

## Structure

- `main.py`: The main entry point for the functions.
- `requirements.txt`: Lists the dependencies required for the functions.
- `__pycache__/`: Contains the compiled bytecode files.

## Setting Up the Virtual Environment

To set up the virtual environment, follow these steps:

1. **Remove the existing virtual environment** (if it exists):

```sh
rm -rf venv
```

2. **Create a new virtual environment**:

```sh
python3 -m venv venv
```

3. **Activate the virtual environment**:

```sh
source venv/bin/activate
```

4. **Install the required packages**:

```sh
pip install -r requirements.txt
```

## Deactivating and Reactivating the Virtual Environment

To deactivate the virtual environment, use the following command:

```sh
deactivate
```

To reactivate the virtual environment, use the following command:

```sh
source venv/bin/activate
```

## Running the Functions

To run the functions, ensure that the virtual environment is activated and then execute the `main.py` file:

```sh
python main.py
```

## Additional Information

- Ensure that you have Python 3 installed on your system.
- Make sure to keep the `requirements.txt` file updated with any new dependencies.
