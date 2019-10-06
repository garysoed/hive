start
  = (component "\n")*

component
  = comment / empty_line

empty_line
  = " " *

comment
  = " "* "# " [^\n]*
