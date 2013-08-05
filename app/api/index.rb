# Syntax: ruby index.rb > index.json

require "json"

recipes = Dir.glob("details/*.md").collect do |filename|
  {
    slug: File.basename(filename).gsub(/\.md/, ''),
    title: File.read(filename).split(/\n/)[0].chomp
  }
end

puts recipes.to_json