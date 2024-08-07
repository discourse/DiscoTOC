# frozen_string_literal: true

RSpec.describe "DiscoTOC", system: true do
  let!(:theme) { upload_theme_component }

  fab!(:category)
  fab!(:user) { Fabricate(:user, trust_level: TrustLevel[1], refresh_auto_groups: true) }

  fab!(:topic_1) { Fabricate(:topic) }
  fab!(:post_1) do
    Fabricate(
      :post,
      raw:
        "<div data-theme-toc='true'></div>\n\n# Heading 1\nContent for the first heading\n## Heading 2\nContent for the second heading\n### Heading 3\nContent for the third heading\n# Heading 4\nContent for the fourth heading",
      topic: topic_1,
    )
  end

  before { sign_in(user) }

  it "composer has table of contents button" do
    visit("/c/#{category.id}")

    find("#create-topic").click
    find(".toolbar-popup-menu-options").click

    expect(page).to have_css("[data-name='Insert table of contents']")
  end

  it "table of contents button inserts markup into composer" do
    visit("/c/#{category.id}")

    find("#create-topic").click
    find(".toolbar-popup-menu-options").click
    find("[data-name='Insert table of contents']").click

    expect(page).to have_css(".d-editor-preview [data-theme-toc='true']")
  end

  it "table of contents button is hidden by trust level setting" do
    theme.update_setting(:minimum_trust_level_to_create_TOC, "2")
    theme.save!

    visit("/c/#{category.id}")

    find("#create-topic").click
    find(".toolbar-popup-menu-options").click

    expect(page).to have_no_css("[data-name='Insert table of contents']")
  end

  it "table of contents button does not appear on replies" do
    visit("/t/#{topic_1.id}")

    find(".reply").click
    find(".toolbar-popup-menu-options").click

    expect(page).to have_no_css("[data-name='Insert table of contents']")
  end

  context "when enable TOC for replies" do
    before do
      theme.update_setting(:enable_TOC_for_replies, true)
      theme.save!
    end

    it "table of contents button does appear on replies" do
      visit("/t/#{topic_1.id}")

      find(".reply").click
      find(".toolbar-popup-menu-options").click

      expect(page).to have_css("[data-name='Insert table of contents']")
    end
  end
end
